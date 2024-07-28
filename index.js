require("dotenv").config();
const express = require("express");
const passport = require("passport");
const passportJWT = require("passport-jwt");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

const app = express();
const { ExtractJwt, Strategy: JwtStrategy } = passportJWT;

const pool = new Pool({});

const SECRET_KEY = process.env.SECRET_KEY;

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: SECRET_KEY,
    },
    async (jwtPayload, done) => {
      try {
        const result = await pool.query("SELECT * FROM users WHERE id = $1", [
          jwtPayload.id,
        ]);
        const user = result.rows[0];

        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

app.use(passport.initialize());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
