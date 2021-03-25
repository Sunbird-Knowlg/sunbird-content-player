
node() {
    try {
        String ANSI_GREEN = "\u001B[32m"
        String ANSI_NORMAL = "\u001B[0m"
        String ANSI_BOLD = "\u001B[1m"
        String ANSI_RED = "\u001B[31m"
        String ANSI_YELLOW = "\u001B[33m"

        ansiColor('xterm') {
            stage('Checkout') {
                cleanWs()
                checkout scm
                commit_hash = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                build_tag = sh(script: "echo " + params.github_release_tag.split('/')[-1] + "_" + commit_hash + "_" + env.BUILD_NUMBER, returnStdout: true).trim()
                echo "artifact_version: " + artifact_version

                stage('Build') {
                    sh """
                        export player_version_number=${branch_name}
                        export build_number=${commit_hash}
                        export filter_plugins=false # For the preview build generation dont split the plugins.
                        cd player
                        npm install
                        npm run build-preview ekstep
                        grunt compress:preview
                        grunt generate-libs
                        #grunt renderer-test
                        #grunt build-jsdoc
                    """
                }
                stage('ArchiveArtifacts') {
                    sh """
                        mkdir CR_Preview_Artifacts
                        cp player/preview.zip CR_Preview_Artifacts
                        #cp player/libs.zip CR_Preview_Artifacts
                        zip -j CR_Preview_Artifacts.zip:${artifact_version} CR_Preview_Artifacts/*                      
                    """
                    archiveArtifacts "CR_Preview_Artifacts.zip:${artifact_version}"
                    sh """echo {\\"artifact_name\\" : \\"CR_Preview_Artifacts.zip\\", \\"artifact_version\\" : \\"${artifact_version}\\", \\"node_name\\" : \\"${env.NODE_NAME}\\"} > metadata.json"""
                    archiveArtifacts artifacts: 'metadata.json', onlyIfSuccessful: true
                    currentBuild.description = "${artifact_version}"
                }
            }
        }
    }
    catch (err) {
        currentBuild.result = "FAILURE"
        throw err
    }

}
