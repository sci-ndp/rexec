# SciDx Remote Execution

Remote Execution (Rexec) is a lightweight framework to enable remote code execution from Jupyter Notebooks or Python scripts to remote compute resources. It is designed to work with the [NDP Endpoint]


[Installation](#installation)
    - [Local Dev Setup](#local-dev-setup)
    - [Optional Standalone Install](#optional-standalone-install)
<br>

[Guide](#guide)
    - [NDP Endpoint Provider](#ndp-endpoint-provider)
    - [End User](#end-user)
    - [Streaming Mode Spec](#streaming-mode-spec)
<br>

[Source Repo](#source-repo)



## Installation
    
```sh
pip install ndp_ep[rexec]
```

If you're using zsh, wrap extras in double quotes to avoid `[]` glob expansion:
`pip install "ndp_ep[rexec]"`


### Local Dev Setup
1.  ep-py-lib local dev - editable ep lib
    > scidx-rexec lib will be installed as a dependency from PyPI.
    ```
    git clone https://github.com/sci-ndp/ndp-ep-py.git
    cd ndp-ep-py
    pip install -e ".[rexec]"
    ```
    

2.  rexec local dev - editable rexec lib
    ```
    git clone https://github.com/sci-ndp/SciDx-rexec.git
    cd Scidx-rexec
    pip install -e .
    ```

### Optional Standalone Install: 
1. rexec client lib can be installed directly from PyPI:
    ```sh
    pip install scidx-rexec
    ```
    [direct-rexec-lib.ipynb](./demo/direct-rexec-lib.ipynb) shows how to use rexec lib directly without orchastrating with NDP Endpoint.

<br>

## Guide
### NDP Endpoint Provider:
Follow the sysadmin deployment flow in [`sysadmin-guide.md`](./sysadmin-guide.md).

### End User: 
Learn to use NDP Endpoint with Remote Execution, walk through the example notebook: [`ndp-ep-rexec.ipynb`](./demo/ndp-ep-rexec.ipynb).

### Streaming Mode Spec:
For long-running workloads (for example Kafka subscriptions), see: [`streaming-mode-spec.md`](./streaming-mode-spec.md).

<br>

## Source Repo:
|              |                                                                                       |
|--------------|---------------------------------------------------------------------------------------|
| Client       | https://github.com/sci-ndp/SciDx-rexec                                                |
| Server       | https://github.com/sci-ndp/SciDx-rexec-server                                         |
| Broker       | https://github.com/sci-ndp/SciDx-rexec-broker                                         |
| Deploy API   | https://github.com/sci-ndp/rexec-server-k8s-deployment-api                            |
