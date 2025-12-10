pipeline {
    agent any

    environment {
        CI = 'true'
        NODE_ENV = 'test'
        BASE_URL = 'http://127.0.0.1:5173'
    }

    stages {
        stage('Checkout') {
            steps {
                echo '📦 Descargando código de tests...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '📥 Instalando dependencias...'
                script {
                    if (isUnix()) {
                        sh 'npm install'
                        sh 'npx playwright install --with-deps'
                    } else {
                        bat 'npm install && npx playwright install --with-deps'
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
        }
        
        success {
            echo '✅ Tests pasaron exitosamente'
        }
        
        failure {
            echo '❌ Tests fallaron'
        }
    }
}
