# SciDx Remote Execution

Remote Execution (Rexec) is a lightweight framework to enable remote code execution from Jupyter Notebooks or Python scripts to remote compute resources. It is designed to work with the [NDP Endpoint]


End User: [User Guide](#user-guide)
<br>

NDP Endpoint Provider(sysadmin): [NDP Endpoint Provider Guide](#ndp-endpoint-provider-guide)
<br>

Developer: [Developer Guide](#for-developer)
| [Source Repos](#source-repos)


## User Guide

#### Installation
```sh
pip install ndp_ep[rexec]
```

If you're using zsh, wrap extras in double quotes to avoid `[]` glob expansion:
`pip install "ndp_ep[rexec]"`

#### Getting Started
Learn to use NDP Endpoint with Remote Execution, walk through the example notebook: [`ndp-ep-rexec.ipynb`](./user/ndp-ep-rexec.ipynb).

<br>

## NDP Endpoint Provider Guide
#### For sysadmins:
Follow the sysadmin deployment flow install server side components: [`rexec-helm`](https://github.com/sci-ndp/rexec/blob/main/helm/README.md).
<br>
By following the helm deployment, you will deploy 3 components: 
1. Rexec Broker, 
2. Rexec Deployment API(spawn api), 
3. NDP Endpoint API(ep-api)

which are shown and highlighted on the right of the diagram below.

![Rexec System Architecture](./reference/svg/rexec-sysadmin-highlight.svg)

[View the system architecture diagram (SVG)](./reference//svg/rexec-sysadmin-highlight.svg)
<br>

Legacy manual deployment instructions are in [`manual-deploy`](./reference/legacy-doc/sysadmin-guide.md).

<br>

## For Developer
#### Local Dev Setup
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

#### Optional Standalone Install: 
1. rexec client lib can be installed directly from PyPI:
    ```sh
    pip install scidx-rexec
    ```
    [direct-rexec-lib.ipynb](./demo/direct-rexec-lib.ipynb) shows how to use rexec lib directly without orchastrating with NDP Endpoint.

## Source Repos:
|              |                                                                                       |
|--------------|---------------------------------------------------------------------------------------|
| Client       | https://github.com/sci-ndp/SciDx-rexec                                                |
| Server       | https://github.com/sci-ndp/SciDx-rexec-server                                         |
| Broker       | https://github.com/sci-ndp/SciDx-rexec-broker                                         |
| Deploy API   | https://github.com/sci-ndp/rexec-server-k8s-deployment-api                            |
