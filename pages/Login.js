import React, { useState } from "react";

import { css } from "@emotion/react";
import { Layout } from "../components/layout/Layout";
import { Form, Field, InputSubmit, Error } from "./../components/ui/Form";
import { UseValidation } from "./../hooks/UseValidation";
import FirebaseInit from "./../firebase/Index";
import loginValidate from "../validations/LoginValidate";
import Router from "next/router";

const initialState = {
  email: "",
  password: "",
};
export default function Login() {
  const [registerError, setRegisterError] = useState(null);

  const { values, errors, handleChange, handleSubmit, handleBlur } =
    UseValidation(initialState, loginValidate, login);

  const { email, password } = values;

  async function login() {
    try {
      await FirebaseInit.login(email, password);
      Router.push("/");
    } catch (error) {
      console.log(error);

      setRegisterError(error.message);
    }
  }

  return (
    <div>
      <Layout>
        <>
          <h1
            css={css`
              text-align: center;
              margin-top: 5rem;
            `}
          >
            Iniciar Sesión
          </h1>
          <Form onSubmit={handleSubmit} noValidate>
            <Field>
              <label htmlFor="email">Correo</label>
              <input
                type="email"
                name="email"
                placeholder="Correo"
                value={email}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </Field>
            {errors.email && <Error>{errors.email}</Error>}

            <Field>
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={password}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </Field>
            {errors.password && <Error>{errors.password}</Error>}

            {registerError && <Error>{registerError}</Error>}
            <InputSubmit type="submit" value="Acceder" />
          </Form>
        </>
      </Layout>
    </div>
  );
}
