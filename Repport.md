talk about cors
talk about MEDIA_URL in setting in security_service


1- Descriptif du projet : we create an backend who can extendable via micro service
2- main  features of project: manage products,salles , emplyee , cameras and used deep learning model for detect any shoplifting case 

3- system architecture: we have 6 micro services(listihom: user_service , product_service , salles_service , emplyee_service , auth_service , model_worker_service) and each micro service have its own apps and database and the communictaion betwwen them is via http requests 

migration

1-exmaple crud with auth 

how endpoint crud working : 
    1- receive request
    2- check token
    3- check role
    4- check permission
    5- validate data
    6- execute query
    7- return response

the best practice for use endpoints in postman(collection,variables,auth,environment)

5- security features (jwt , roles , permissions)

the use of MEDIA_URL in django (for deployement)

2-service registry/discovery 


3-Deploiement multi-serveurs: Cors

how auth works (dans le cas de frontend we save the tokens in session and we send the access token in the headers of each request)
    

6- how to extend project we can run many instances from each service and the load balancer will distribute the requests between them 
    
3- how to run project



gatway: the principle endpoitn to the frontend to get all services urls from consul regestery


we use consul as service registry so that each service store his adress in the start and the othiers services can discovery his adress and comunnicate with him and this is helpfull to avoid hardcoded IP addresses and improve flexibility when services scale