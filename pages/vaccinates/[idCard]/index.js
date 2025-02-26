import React, { useState, useContext, useEffect } from "react";
import { Layout } from "../../../components/layout/Layout";
import { Form, Field, ButtonSubmit, Error } from "../../../shared/Form";
import { useRouter } from "next/router";
import { UseForm } from "../../../hooks/UseForm";

import WithAuth from "../../../components/unavacuna/WithAuth";
import ErrorPage from "../../404";
import vaccinate from "../../../validations/Vaccinate";
import UseIsMounted from "../../../hooks/UseIsMounted";
import FirebaseContext from "../../../firebase/FirebaseContext";

const doses = ["Dosis 1", "Dosis 2", "Dosis 3", "Refuerzo"];

const initialState = {
  namePatient: "",
  vaccineName: "",
  dose: "",
  vaccinationPlace: "",
  detail: "",
};
const Vaccinate = () => {
  const { user } = useContext(FirebaseContext);

  const isMounted = UseIsMounted();
  const router = useRouter();

  const {
    query: { idCard },
  } = router;

  const [registerError, setRegisterError] = useState(null);
  const [notExists, setNotExists] = useState(false);
  const [vaccinates, setVaccinates] = useState([]);
  const [consultBD, setConsultBD] = useState(true);
  const [redirect, setRedirect] = useState(false);
  const [isLoaded, setIsLoaded] = useState(true);
  const [vaccines, setVaccines] = useState([]);
  const [patient, setPatient] = useState([]);
  const [errors, setErrors] = useState({});

  const [formValues, handleInputChange] = UseForm(initialState);

  const { firestore } = useContext(FirebaseContext);

  const { vaccineName, dose, vaccinationPlace, detail } = formValues;

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
          detail: detail==="" ? "N/A": detail,
          vaccinationDate: Date.now(),
          createdBy: user.email,
        };

        const vaccine = vaccines.find(x => x.name === vaccineName);
        vaccine.quantity = vaccine.quantity - 1;

        firestore.collection("vaccinates").add(vaccinate);
        firestore.collection("vaccines").doc(vaccine.name).update(vaccine);

        setRedirect(true);
      } catch (error) {
        setRegisterError(error.message);
      }
    } else {
      const validationErrors = vaccinate(formValues);
      setErrors(validationErrors.errors);
    }
  }

  const getDataVaccines = () => {
    firestore
      .collection("vaccines")
      .orderBy("quantity")
      .startAfter(0)
      .onSnapshot(callSnapShot);
  };

  function callSnapShot(snapshot) {
    const vaccinesData = snapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });

    setVaccines(vaccinesData);
  }

  const getPatient = async () => {
    const query = await firestore.collection("patients").doc(idCard);
    const patient = await query.get();

    if (patient.exists && isLoaded) {
      setConsultBD(false);
      setPatient(patient.data());
      getDataVaccines();
    } else if (isLoaded) {
      setConsultBD(false);
      setNotExists(true);
    }
  };

  const getData = () => {
    firestore
      .collection("vaccinates")
      .orderBy("vaccinationDate", "desc")
      .onSnapshot(callSnapShot1);
  };

  function callSnapShot1(snapshot) {
    const data = snapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });
    if (isLoaded) setVaccinates(data);
  }

  useEffect(() => {
    if (idCard && consultBD) {
      getData();
      getPatient();
    }

    return () => {
      setIsLoaded(false);
    };
  }, [idCard, consultBD]);

  useEffect(() => {
    if (redirect) return router.push("/vaccinates");
  }, [redirect]);

  if (!isMounted) {
    <ErrorPage msg={"Problemas al encontrar la pagina"} />;
  }

  if (!Object.keys(patient).length && !notExists) return "Cargando...";

  return notExists ? (
    <ErrorPage msg={"No existe el paciente"} />
  ) : (
    <Layout>
      <Form onSubmit={handleRegister}>
        <h1>Aplicar Vacuna</h1>
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
            {vaccines.map((item, index) => {
              return (
                <option key={index} value={item.name}>
                  {item.name}
                </option>
              );
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
            {doses.map((item) => (
              <option
                key={item}
                value={item}
                disabled={vaccinates.find(x => x.dose === item && x.idCardPatient === patient.idCard)}
              >
                {item}
              </option>
            ))}

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

        <Field>
          <label htmlFor="namePatient">Detalle</label>
          <input
            type="text"
            name="detail"
            placeholder="Detalle"
            value={detail}
            onChange={handleInputChange}
          />
        </Field>

        {registerError && <Error>{registerError}</Error>}

        <ButtonSubmit type="submit" value="Registrar">
        <i class="fas fa-save"></i> Registrar
        </ButtonSubmit>

      </Form>
    </Layout >
  );
};

export default WithAuth(Vaccinate);
