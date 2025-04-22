# GenShop

GenShop is an interactive eCommerce platform where users can create unique products using generative AI. It combines cutting-edge technology to provide secure access, streamlined payments, and moderation for AI-generated products.

## Features

### Seamless Shopping Experience

- Users are able to search, filter, cart, and checkout products.

### AI Product Creation

- Users can generate unique, highly detailed products using generative AI, allowing for personalized and creative designs.

### Payment Integration

- Streamlined checkout with Stripe enables secure payment processing, with automated fulfillment for a smooth purchasing experience.

### Product Moderation

- AI-generated products are reviewed by an admin to ensure they meet quality standards.

### Security

- User Passwords encrypted with bcrypt and a salt. User authentication is done through JSON web tokens.

## Technologies Used

- **Frontend:** React.js, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Payments:** Stripe

## Setup

### 1. Create .env in the root directory of the project

```
VITE_APP_API_URL=
VITE_STRIPE_PUBLIC_KEY=
VITE_STRIPE_SECRET_KEY=
MONGO_URI=
SECRET_KEY=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
STRIPE_SECRET_KEY=
```

### 2. Build and Run the Docker Containers

```

docker compose build
docker compose up
```

## License

This project is licensed under the MIT License.
