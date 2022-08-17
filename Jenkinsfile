
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
                if (params.github_release_tag == "") {
                    checkout scm
                    commit_hash = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    branch_name = sh(script: 'git name-rev --name-only HEAD | rev | cut -d "/" -f1| rev', returnStdout: true).trim()
                    artifact_version = branch_name + "_" + commit_hash
                    println(ANSI_BOLD + ANSI_YELLOW + "github_release_tag not specified, using the latest commit hash: " + commit_hash + ANSI_NORMAL)
                } else {
                    def scmVars = checkout scm
                    checkout scm: [$class: 'GitSCM', branches: [[name: "refs/tags/${params.github_release_tag}"]], userRemoteConfigs: [[url: scmVars.GIT_URL]]]
                    artifact_version = params.github_release_tag
                    commit_hash = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    branch_name = params.github_release_tag
                    println(ANSI_BOLD + ANSI_YELLOW + "github_release_tag specified, building from github_release_tag: " + params.github_release_tag + ANSI_NORMAL)
                    sh "git clone https://github.com/project-sunbird/sunbird-content-plugins.git plugins"
                    sh """
                        cd plugins
                        checkout_tag=\$(git ls-remote --tags origin release-* | grep -o 'release-.*' | sort -V | tail -n1)
                        git checkout tags/\${checkout_tag} -b \${checkout_tag}
                        
                    """
                }
                echo "artifact_version: " + artifact_version

                stage('Build') {
                    sh """
                        #s3 preview deployment
                        export player_version_number=${branch_name}
                        export build_number=${commit_hash}
                        export filter_plugins=false # For the preview build generation dont split the plugins.
                        sudo npm i -g grunt
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
