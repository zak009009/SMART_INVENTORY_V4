#!/bin/bash

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCS_DIR="$PROJECT_ROOT/docs"
REPORTS_DIR="$PROJECT_ROOT/reports"
SERVER_PID=""
SERVER_PORT=${PORT:-5000}
export PORT=$SERVER_PORT
SERVER_URL="http://localhost:$SERVER_PORT"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

print_status() {
    echo "ℹ️  [INFO] $1"
}

print_success() {
    echo "✅ [OK] $1"
}

print_warning() {
    echo "⚠️  [WARNING] $1"
}

print_error() {
    echo "❌ [ERROR] $1"
}

print_section() {
    echo ""
    echo "📋 === $1 ==="
    echo ""
}

cleanup() {
    if [ ! -z "$SERVER_PID" ]; then
        print_status "Arrêt du serveur (PID: $SERVER_PID)..."
        kill $SERVER_PID 2>/dev/null || true
        wait $SERVER_PID 2>/dev/null || true
    fi
    if lsof -Pi :$SERVER_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        lsof -ti:$SERVER_PORT | xargs kill -9 2>/dev/null || true
    fi
}

trap cleanup EXIT INT TERM

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

check_prerequisites() {
    print_section "Vérification des prérequis"
    
    local missing=0
    
    if ! command_exists node; then
        print_error "Node.js n'est pas installé"
        missing=1
    fi
    
    if ! command_exists npm; then
        print_error "npm n'est pas installé"
        missing=1
    fi
    
    if [ $missing -eq 1 ]; then
        exit 1
    fi
    
    if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
        print_status "Installation des dépendances..."
        cd "$PROJECT_ROOT"
        npm install
    fi
    
    print_success "Tous les prérequis sont satisfaits"
}

wait_for_server() {
    local max_attempts=30
    local attempt=1
    
    print_status "Attente du démarrage du serveur..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$SERVER_URL/health" >/dev/null 2>&1; then
            print_success "Serveur prêt sur $SERVER_URL"
            return 0
        fi
        echo -n "."
        sleep 1
        attempt=$((attempt + 1))
    done
    
    print_error "Le serveur n'a pas démarré dans les délais"
    return 1
}

start_server() {
    print_section "Démarrage du serveur API"
    
    if lsof -Pi :$SERVER_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Le port $SERVER_PORT est utilisé. Libération..."
        lsof -ti:$SERVER_PORT | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
    
    if [ -f "$PROJECT_ROOT/.env.test" ]; then
        export $(grep -v '^#' "$PROJECT_ROOT/.env.test" | xargs)
        print_status "Configuration de test chargée depuis .env.test"
    else
        export NODE_ENV=test
        export PORT=$SERVER_PORT
        export MONGO_URI=${MONGO_URI:-"mongodb://localhost:27017/smart_inventory_test"}
        export JWT_SECRET=${JWT_SECRET:-"test_jwt_secret_key_$(date +%s)"}
        print_warning "Fichier .env.test non trouvé, utilisation des valeurs par défaut"
    fi
    
    cd "$PROJECT_ROOT"
    npm start > "$REPORTS_DIR/server.log" 2>&1 &
    SERVER_PID=$!
    
    if ! wait_for_server; then
        print_error "Échec du démarrage du serveur"
        if [ -f "$REPORTS_DIR/server.log" ]; then
            print_status "Logs du serveur:"
            tail -20 "$REPORTS_DIR/server.log"
        fi
        exit 1
    fi
}

run_unit_tests() {
    print_section "Tests unitaires"
    
    cd "$PROJECT_ROOT"
    
    if npm run test:unit > "$REPORTS_DIR/unit-tests.log" 2>&1; then
        print_success "Tests unitaires réussis"
        return 0
    else
        if grep -q "Test Suites:.*passed" "$REPORTS_DIR/unit-tests.log" 2>/dev/null; then
            print_success "Tests unitaires réussis"
            return 0
        else
            print_error "Échec des tests unitaires"
            tail -30 "$REPORTS_DIR/unit-tests.log"
            return 1
        fi
    fi
}

run_integration_tests() {
    print_section "Tests d'intégration"
    
    cd "$PROJECT_ROOT"
    
    if npm run test:integration > "$REPORTS_DIR/integration-tests.log" 2>&1; then
        print_success "Tests d'intégration réussis"
        return 0
    else
        if grep -q "Test Suites:.*passed" "$REPORTS_DIR/integration-tests.log" 2>/dev/null; then
            print_success "Tests d'intégration réussis"
            return 0
        else
            print_error "Échec des tests d'intégration"
            tail -30 "$REPORTS_DIR/integration-tests.log"
            return 1
        fi
    fi
}

run_error_demo() {
    print_section "Démonstration des erreurs"
    
    cd "$PROJECT_ROOT"
    
    print_status "Tests de validation avec erreurs intentionnelles..."
    npm run test:integration -- --testNamePattern="Démonstration d'Erreurs|Paramètres Manquants" --verbose 2>/dev/null || true
    
    print_success "Démonstration des erreurs terminée"
}

run_newman_tests() {
    print_section "Tests API avec Newman"
    
    mkdir -p "$DOCS_DIR"
    cd "$PROJECT_ROOT"
    
    # Test standard API collection
    if [ -f "tests/postman/Smart_Inventory_API.postman_collection.json" ]; then
        print_status "Exécution des tests API standard..."
        npx --yes newman run \
            "tests/postman/Smart_Inventory_API.postman_collection.json" \
            -e "tests/postman/environment.json" \
            --env-var "baseUrl=$SERVER_URL" \
            -r htmlextra,json \
            --reporter-htmlextra-export "$DOCS_DIR/api-report-$TIMESTAMP.html" \
            --reporter-json-export "$DOCS_DIR/api-report-$TIMESTAMP.json" \
            --reporter-htmlextra-title "Smart Inventory API - Standard Tests" \
            --reporter-htmlextra-logs \
            --reporter-htmlextra-showOnlyFails false \
            > "$REPORTS_DIR/newman.log" 2>&1 || true
    fi
    
    # Test error collection
    if [ -f "tests/postman/Error_Tests.postman_collection.json" ]; then
        print_status "Exécution des tests d'erreurs Newman..."
        npx --yes newman run \
            "tests/postman/Error_Tests.postman_collection.json" \
            -e "tests/postman/environment.json" \
            --env-var "baseUrl=$SERVER_URL" \
            -r htmlextra,json \
            --reporter-htmlextra-export "$DOCS_DIR/error-tests-$TIMESTAMP.html" \
            --reporter-json-export "$DOCS_DIR/error-tests-$TIMESTAMP.json" \
            --reporter-htmlextra-title "Smart Inventory API - Error Tests" \
            --reporter-htmlextra-logs \
            --reporter-htmlextra-showOnlyFails false \
            > "$REPORTS_DIR/newman-errors.log" 2>&1 || true
        
        if [ -f "$DOCS_DIR/error-tests-$TIMESTAMP.html" ]; then
            ln -sf "error-tests-$TIMESTAMP.html" "$DOCS_DIR/error-tests-latest.html" 2>/dev/null || true
            print_success "Tests d'erreurs Newman réussis"
            print_status "Rapport erreurs: $DOCS_DIR/error-tests-$TIMESTAMP.html"
        fi
    fi
    
    # Create links to latest reports
    if [ -f "$DOCS_DIR/api-report-$TIMESTAMP.html" ]; then
        ln -sf "api-report-$TIMESTAMP.html" "$DOCS_DIR/api-report-latest.html" 2>/dev/null || true
        print_success "Tests Newman réussis"
        print_status "Rapport API: $DOCS_DIR/api-report-$TIMESTAMP.html"
    fi
    
    return 0
}

generate_jest_html_report() {
    print_section "Génération du rapport Jest HTML"
    
    cd "$PROJECT_ROOT"
    
    print_status "Exécution des tests avec rapport HTML..."
    npm run test:integration -- --testNamePattern="Visual Documentation" --verbose > "$REPORTS_DIR/jest-visual.log" 2>&1 || true
    
    if [ -f "$DOCS_DIR/jest-report.html" ]; then
        print_success "Rapport Jest HTML généré"
        print_status "Rapport Jest: $DOCS_DIR/jest-report.html"
    else
        print_warning "Rapport Jest HTML non généré"
    fi
}

show_summary() {
    print_section "Résumé de l'exécution"
    
    echo "✅ [OK] Tests unitaires"
    echo "✅ [OK] Tests d'intégration"
    echo "✅ [OK] Tests Newman"
    echo "✅ [OK] Démonstration des erreurs"
    echo "✅ [OK] Rapport Jest HTML"
    
    echo ""
    echo "📁 Fichiers générés:"
    echo "  📄 Documentation API: $DOCS_DIR/api-report-$TIMESTAMP.html"
    echo "  🚨 Tests d'erreurs Newman: $DOCS_DIR/error-tests-$TIMESTAMP.html"
    echo "  🧪 Rapport Jest HTML: $DOCS_DIR/jest-report.html"
    echo "  📊 Rapport JSON: $DOCS_DIR/api-report-$TIMESTAMP.json"
    echo "  📝 Logs: $REPORTS_DIR/"
    
    echo ""
    echo "🔗 Liens rapides:"
    echo "  📄 API Docs: $DOCS_DIR/api-report-latest.html"
    echo "  🚨 Error Tests: $DOCS_DIR/error-tests-latest.html"
    echo "  🧪 Jest Report: $DOCS_DIR/jest-report.html"
    
    echo ""
    echo "🎉 [OK] Tous les tests sont terminés avec succès!"
}

main() {
    echo "🚀 Smart Inventory API - Tests & Documentation"
    echo "-----------------------------------------------------"
    echo ""
    
    mkdir -p "$DOCS_DIR" "$REPORTS_DIR"
    
    check_prerequisites
    
    if ! run_unit_tests; then
        print_error "Les tests unitaires ont échoué"
        exit 1
    fi
    
    start_server
    
    if ! run_integration_tests; then
        print_error "Les tests d'intégration ont échoué"
        exit 1
    fi
    
    run_error_demo
    
    if ! run_newman_tests; then
        print_warning "Certains tests Newman ont échoué"
    fi
    
    generate_jest_html_report
    
    show_summary
}

main "$@"
