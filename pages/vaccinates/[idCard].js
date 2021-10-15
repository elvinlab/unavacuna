import React, { useState, useContext, useEffect } from "react";
import { Layout } from "../../components/layout/Layout";
import { Form, Field, InputSubmit, Error } from "../../shared/Form";
import { useRouter } from "next/router";
import UseIsMounted from "../../hooks/UseIsMounted";

import WithAuth from "../../components/unavacuna/WithAuth";
import FirebaseContext from "../../firebase/FirebaseContext";
import { UseForm } from "./../../hooks/UseForm";
import vaccinate from "../../validations/Vaccinate";

const initialState = {
  namePatient: "",
  vaccineName: "",
  dose: "",
  vaccinationPlace: "",
};
const Vaccinate = () => {
  const isMounted = UseIsMounted();
  const router = useRouter();

  const {
    query: { idCard },
  } = router;

  const [vaccines, setVaccines] = useState([]);
  const [registerError, setRegisterError] = useState(null);
  const [regSuccess, setRegSuccess] = useState(false);
  const [notExists, setNotExists] = useState(false);
  const [consultBD, setConsultBD] = useState(true);

  const [patient, setPatient] = useState([]);
  const [errors, setErrors] = useState({});

  const [formValues, handleInputChange] = UseForm(initialState);

  const { firestore } = useContext(FirebaseContext);

  const { vaccineName, dose, vaccinationPlace } = formValues;

  const handleBlur = () => {
    const validationErrors = vaccinate(formValues);
    setErrors(validationErrors.errors);
  };

  async function handleRegister(e) {
    e.preventDefault();

    if (vaccinate(formValues).formIsValid) {
      try {
        const vaccinate = {
          idCardPatient: idCard,
          namePatient: `${patient.name} ${patient.lastName}`,
          vaccineName,
          dose,
          vaccinationPlace,
          vaccinationDate: Date.now(),
        };
        firestore.collection("vaccinates").add(vaccinate);
        setRegSuccess(true);
      } catch (error) {
        setRegisterError(error.message);
      }
    } else {
      const validationErrors = vaccinate(formValues);
      setErrors(validationErrors.errors);
    }
  }

  const getDataVaccine = () => {
    firestore
      .collection("vaccines")
      .orderBy("registerDate", "desc")
      .onSnapshot(callSnapShot);
  };

  function callSnapShot(snapshot) {
    const VACCINE = snapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });
    setVaccines(VACCINE);
  }

  useEffect(() => {
    if (idCard && consultBD) {
      const getPatient = async () => {
        const query = await firestore.collection("patients").doc(idCard);
        const patient = await query.get();

        if (patient.exists) {
          setConsultBD(false);
          setPatient(patient.data());
        } else {
          setConsultBD(false);
          setNotExists(true);
        }
      };

      getPatient();
    }
    getDataVaccine();
  }, [idCard, consultBD, vaccines]);

  useEffect(() => {
    if (regSuccess) {
      return router.push("/vaccinates");
    }
  }, [regSuccess]);

  //Crear la pagina 404 y mandarle por parametro mensaje
  if (!isMounted) {
    return "No se pudo montar esta vara";
  }

  //Se puede tunear mas con un styled componete tipo spinner
  if (!Object.keys(patient).length && !notExists) return "Cargando...";

  return notExists ? (
    <h1>No existe el paciente, llamar 404</h1>
  ) : (
    <Layout>
      <Form onSubmit={handleRegister}>
        <h1>Registrar Vacunado</h1>
        <Field>
          <label htmlFor="idCardPatient">Cédula</label>
          <input
            type="number"
            name="idCardPatient"
            value={patient.idCard}
            readOnly
            disabled
          />
        </Field>
        {errors.idCardPatient && <Error>{errors.idCardPatient}</Error>}

        <Field>
          <label htmlFor="namePatient">Nombre de Paciente</label>
          <input
            type="text"
            name="namePatient"
            value={`${patient.name} ${patient.lastName}`}
            readOnly
            disabled
          />
        </Field>

        <Field>
          <label htmlFor="vaccineName">Vacuna</label>
          <select
            id="vaccineName"
            name="vaccineName"
            value={vaccineName}
            onChange={handleInputChange}
          >
            <option value="">Seleccione ▼</option>;
            {vaccines.map((item, i) => {
              return <option value={item.name}>{item.name}</option>;
            })}
          </select>
        </Field>
        {errors.vaccineName && <Error>{errors.vaccineName}</Error>}

        <Field>
          <label htmlFor="dose">Dosis</label>
          <select
            id="dose"
            name="dose"
            value={dose}
            onChange={handleInputChange}
          >
            <option value="">Seleccione ▼</option>;
            <option value="Dosis 1">Dosis 1</option>;
            <option value="Dosis 2">Dosis 2</option>;
            <option value="Dosis 3">Dosis 3</option>;
            <option value="Refuerzo">Refuerzo</option>;
          </select>
        </Field>
        {errors.dose && <Error>{errors.dose}</Error>}

        <Field>
          <label htmlFor="vaccinationPlace">Lugar de Vacunación</label>
          <input
            type="text"
            name="vaccinationPlace"
            placeholder="Lugar de Vacunación"
            value={vaccinationPlace}
            onChange={handleInputChange}
            onBlur={handleBlur}
          />
        </Field>
        {errors.vaccinationPlace && <Error>{errors.vaccinationPlace}</Error>}

        {registerError && <Error>{registerError}</Error>}

        <InputSubmit type="submit" value="Registrar" />
      </Form>
    </Layout>
  );
};

export default WithAuth(Vaccinate);
