# FIAP Tech Challenge - Fastfood Kiosk Auth Function

## Description

This project is the authentication function for the Fastfood Kiosk application. It is responsible for managing the authentication of the customers, by creating a customer, if it does not exists, or retrieving the customer JWT token, if it already exists with given CPF.

## Technologies Used

The application was developed using a vanilla Node.js, using the Google Cloud Functions Framework for testing locally.

MySQL was also used as the database for data persistence.

## Installing the application

```bash
nvm use
yarn install
```

## Usage

```bash
yarn start:dev
```

The application will be listening on http://localhost:8080/.

## TODOs

- Reuse the original application implementations (repository, validations, etc)
