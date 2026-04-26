frontend:
    cd frontend
    npm install
    npm run dev

backend:in new terminal
    cd backend
    pip install -r requirements.txt

employee_service:
    cd employee_service
    python manage.py migrate
    python manage.py runserver 8001

product_service:in new terminal
    cd backend/product_service
    python manage.py migrate
    python manage.py runserver 8000

sales_service:in new terminal
    cd backend/sales_service
    python manage.py migrate
    python manage.py runserver 8002