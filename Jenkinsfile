pipeline {
    agent any

    environment {
        CI = 'true'
        NODE_ENV = 'test'
        SKIP_SERVER_START = 'true'
        BASE_URL = 'http://localhost:5173'
    }

    stages {
        stage('Checkout') {
            steps {
                echo '📦 Descargando código del repositorio...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Instalando dependencias...'
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
        }
        
        success {
            echo '✅ Tests pasaron exitosamente'
        }
        
        failure {
            echo '❌ Tests fallaron'
        }
    }
}
