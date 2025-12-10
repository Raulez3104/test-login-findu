pipeline {
    agent any

    environment {
        CI = 'true'
        NODE_ENV = 'test'
        SKIP_SERVER_START = 'true'
        BASE_URL = 'http://127.0.0.1:5173'
        APP_DIR = 'C:\\laragon\\www\\findu-admin'
    }

    stages {
        stage('Checkout Tests') {
            steps {
                echo '📦 Descargando código de tests...'
                checkout scm
            }
        }

        stage('Install Test Dependencies') {
            steps {
                echo '📥 Instalando dependencias de tests...'
                script {
                    if (isUnix()) {
                        sh 'npm install'
                        sh 'npx playwright install --with-deps'
                    } else {
                        bat 'npm install'
                        bat 'npx playwright install --with-deps'
                    }
                }
            }
        }

        stage('Start Application') {
            steps {
                echo '🚀 Iniciando aplicación React...'
                script {
                    if (isUnix()) {
                        sh '''
                            cd "${APP_DIR}"
                            npm install
                            npm run dev > ${WORKSPACE}/app.log 2>&1 &
                            sleep 15
                            curl -f http://127.0.0.1:5173 || exit 1
                        '''
                    } else {
                        bat '''
                            cd /d "%APP_DIR%"
                            call npm install
                            START /B npm run dev
                            timeout /t 15 /nobreak
                        '''
                    }
                }
            }
        }

        stage('Run Tests') {
            steps {
                echo "🧪 Ejecutando pruebas E2E contra: ${BASE_URL}"
                script {
                    if (isUnix()) {
                        sh 'npm run test:e2e'
                    } else {
                        bat 'npm run test:e2e'
                    }
                }
            }
        }
    }

    post {
        always {
            echo '📊 Generando reportes...'
            
            // Publicar reportes de Playwright
            publishHTML([
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Report',
                keepAll: true,
                alwaysLinkToLastBuild: true,
                allowMissing: true
            ])

            // Publicar resultados JUnit
            junit testResults: 'test-results/junit.xml', allowEmptyResults: true

            // Guardar artefactos
            archiveArtifacts artifacts: 'test-results/**', allowEmptyArchive: true
            archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
            archiveArtifacts artifacts: 'app.log', allowEmptyArchive: true

            // Limpiar procesos Node
            script {
                if (isUnix()) {
                    sh 'pkill -f "npm run dev" || true'
                } else {
                    bat 'taskkill /F /IM node.exe /T 2>nul || exit /b 0'
                }
            }
        }
        
        success {
            echo '✅ Tests pasaron exitosamente'
        }
        
        failure {
            echo '❌ Tests fallaron'
        }
    }
}
