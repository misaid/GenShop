import jsonwebtoken, { decode } from 'jsonwebtoken';

// const jsonwebtoken = require('jsonwebtoken');

/**
 *
 * @param {Object} request the request object
 * @param {Object} response the response object
 * @param {*} next
 * @returns
 */
const verifyJWT = (request, response, next) => {
  // console.log(req.cookies)
  try {
    const jwt = request.cookies.jwt;

    if (!jwt) {
      console.log('No token');
      return response
        .status(403)
        .send('A token is required for authentication');
    }
    try {
      const decoded = jsonwebtoken.verify(jwt, process.env.secretKey);
      request.user = decoded;
    } catch (error) {
      return response.status(401).send('Invalid Token');
    }
    return next();
  } catch (error) {
    console.log(error);
  }
};

export default verifyJWT;
