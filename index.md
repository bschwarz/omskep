---
layout: default
title: home
published: true
---

Assists in the generatation of diagrams (png, svg, canvas, etc) based on standard file formats, such as Swagger, OpenAPI, AWS Cloud Formation Templates, Ansible Templates, by providing the text markdown for renderers to take advantage of.

# How to Use It.
Can be used either on the command line (CLI), Node.js or with JavaScript.

## Command line (CLI)
<hr/>
  
### Syntax
~~~
omskep-cli <diagram type> [options (key/value pairs)] <input file> [<input file> <input file> ...]

~~~

### Basic invocation
~~~
omskep-cli sequence -path /pets -verb get petstore.json
~~~

### Pipe contents into the CLI
~~~
  cat petstore.json | omskep-cli sequence -path /pets -verb get -server %title% 
~~~

### Output
~~~
@startuml
!GET = "<color #009fdb>GET</color>"
!POST = "<color #007a3e>POST</color>"
!PUT = "<color #ea7400>PUT</color>"
!DELETE = "<color #cf2a2a>DELETE</color>"
!PATCH = "<color #b5bd00>PATCH</color>"
!HEAD = "<color #9012fe>HEAD</color>"
!OPTIONS = "<color #0d5aa7>OPTIONS</color>"
!if %not(%function_exists("$success"))
!function $success($msg)
<font color=green><b>$msg
!endfunction
!endif
!if %not(%function_exists("$failure"))
!function $failure($msg)
<font color=red><b>$msg
!endfunction
!endif
!if %not(%function_exists("$warning"))
!function $warning($msg)
<font color=orange><b>$msg
!endfunction
!endif

title findPets

participant "Client" as C
participant "API Gateway" as G
C->G: GET /pets
activate G
alt pet response
G-->C: HTTP $success(200)
else unexpected error
G-->C: HTTP $failure(default)
else 
deactivate G
end
@enduml

~~~

### Getting image (local plantuml)
Second and third line are shown with a the ``-theme`` option to give a different theme from the default one (see [puml-themes](https://bschwarz.github.io/puml-themes/)).
~~~
omskep-cli sequence -path /pets -verb get petstore.json | java -jar plantuml.jar -pipe > getPets.png
omskep-cli sequence -path /pets -verb get -theme cerulean petstore.json | java -jar plantuml.jar -pipe > getPets-cerulean.png
omskep-cli sequence -path /pets -verb get -theme superhero petstore.json | java -jar plantuml.jar -pipe > getPets-superhero.png
~~~

### Getting image (remote plantuml server)
Use the ``-pumlurl`` option to generate the url to fetch the image from the plantuml server, using either ``wget`` or ``curl``
~~~
wget $(omskep-cli sequence -path /pets -verb get -pumlurl png petstore.json) -O getPets.png
curl --url $(omskep-cli sequence -path /pets -verb get -theme cerulean -pumlurl png petstore.json) > getPets.png
omskep-cli sequence -path /pets -verb get -theme superhero -pumlurl svg  petstore.json | xargs curl > getPets.svg
~~~

![getPets Diagram](getPets.png) ![getPets Cerulean Diagram](getPets-cerulean.png) ![getPets Superhero Diagram](getPets-superhero.png)


## Node.js
<hr/>

## JavaScript (Browser)
<hr/>

