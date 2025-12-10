pipeline {
    agent any

    environment {
        CI = 'true'
        NODE_ENV = 'test'
        BASE_URL = 'http://127.0.0.1:5173'
        FRONTEND_REPO = 'https://github.com/Raulez3104/FindU-Admin.git'
        FRONTEND_DIR = '${WORKSPACE}/FindU-Admin'
    }

    stages {
        stage('Checkout Tests') {
            steps {
                echo '📦 Descargando código de tests...'
                checkout scm
            }
        }

        stage('Checkout Frontend') {
            steps {
                echo '📦 Clonando frontend desde GitHub...'
                bat 'git clone %FRONTEND_REPO% FindU-Admin'
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '📥 Instalando dependencias...'
                bat '''
                    npm install
                    npx playwright install --with-deps
                    cd /d FindU-Admin
                    npm install
                '''
            }
        }

        stage('Start Frontend') {
            steps {
                echo '🚀 Levantando frontend...'
                bat '''
                    cd /d FindU-Admin
                    START /B npm run dev
                    timeout /t 20 /nobreak
                '''
            }
        }

        stage('Run Tests') {
            steps {
                echo "🧪 Ejecutando pruebas E2E contra: ${BASE_URL}"
                bat 'npm run test:e2e'
            }
        }
    }

    post {
        always {
            echo '📊 Generando reportes...'
            
            publishHTML([
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Report',
                keepAll: true,
                alwaysLinkToLastBuild: true,
                allowMissing: true
            ])

            junit testResults: 'test-results/junit.xml', allowEmptyResults: true

            archiveArtifacts artifacts: 'test-results/**', allowEmptyArchive: true
            archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
            archiveArtifacts artifacts: 'frontend.log', allowEmptyArchive: true

            // Limpiar procesos
            bat 'taskkill /F /IM node.exe /T 2>nul || exit /b 0'
        }
        
        success {
            echo '✅ Tests pasaron exitosamente'
        }
        
        failure {
            echo '❌ Tests fallaron'
        }
    }
}
