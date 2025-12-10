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
                script {
                    if (isUnix()) {
                        sh 'git clone ${FRONTEND_REPO} ${FRONTEND_DIR}'
                    } else {
                        bat 'git clone %FRONTEND_REPO% %FRONTEND_DIR%'
                    }
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '📥 Instalando dependencias...'
                script {
                    if (isUnix()) {
                        sh '''
                            npm install
                            npx playwright install --with-deps
                            cd ${FRONTEND_DIR}
                            npm install
                        '''
                    } else {
                        bat '''
                            npm install
                            npx playwright install --with-deps
                            cd /d %FRONTEND_DIR%
                            npm install
                        '''
                    }
                }
            }
        }

        stage('Start Frontend') {
            steps {
                echo '🚀 Levantando frontend...'
                script {
                    if (isUnix()) {
                        sh '''
                            cd ${FRONTEND_DIR}
                            npm run dev > ${WORKSPACE}/frontend.log 2>&1 &
                            sleep 20
                            curl -f http://127.0.0.1:5173 || exit 1
                        '''
                    } else {
                        bat '''
                            cd /d %FRONTEND_DIR%
                            START /B npm run dev
                            timeout /t 20 /nobreak
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
