frontend:
    cd frontend
    npm install
    npm run dev

consul agent -dev

backend:in new terminal
    cd backend
    pip install -r requirements.txt

product_service:in new terminal
    cd backend/product_service
    python manage.py migrate
    python manage.py runserver
employee_service:
    cd backend/employee_service
    python manage.py migrate
    python manage.py runserver 8001

sales_service:in new terminal
    cd backend/sales_service
    python manage.py migrate
    python manage.py runserver 8002

model_worker_service:in new terminal
    cd backend/model_worker_service
    python manage.py migrate
    python manage.py runserver 8003

security_service:in new terminal
    cd backend/security_service
    python manage.py migrate
    python manage.py runserver 8004

auth_service:in new terminal
    cd backend/auth_service
    python manage.py migrate
    python manage.py runserver 8005

gateway_service:in new terminal
    cd backend/gateway
    python manage.py runserver 8006