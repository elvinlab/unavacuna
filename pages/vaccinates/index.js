import { Layout } from "../../components/layout/Layout";

import WithAuth from "./../../components/unavacuna/WithAuth";
import { useContext, useEffect, useState } from "react";
import FirebaseContext from "../../firebase/FirebaseContext";
import MaterialTable from "material-table";
import {
  TableIcons,
  TableLocalization,
  TableOptions,
} from "../../helpers/TableInit";
import { css } from "@emotion/react";

import Visibility from "@material-ui/icons/Visibility";
import Add from "@material-ui/icons/Add";
import UseIsMounted from "../../hooks/UseIsMounted";
import { PrepareDateFormat } from "../../helpers/PrepareDateFormat";
import { useRouter } from "next/router";

const Vaccinates = () => {
  const isMounted = UseIsMounted();

  const router = useRouter();

  const [vaccinates, setVaccinates] = useState([]);
  const [isLoaded, setIsLoaded] = useState(true);

  const { firestore } = useContext(FirebaseContext);

  const getData = () => {
    firestore
      .collection("vaccinates")
      .orderBy("vaccinationDate", "desc")
      .onSnapshot(callSnapShot);
  };

  function callSnapShot(snapshot) {
    const data = snapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });

    const newData = PrepareDateFormat(data);

    if (isLoaded) setVaccinates(newData);
  }

  useEffect(() => {
    getData();
    return () => {
      setIsLoaded(false);
    };
  }, []);

  return (
    isMounted && (
      <Layout>
        <h1
          css={css`
            text-align: center;
            color: var(--red);
          `}
        >
          Vacunados
        </h1>

        <MaterialTable
          style={{ margin: "2rem", padding: "1rem" }}
          title={`reporte_pacientes-${new Date().toLocaleDateString("es-CR")}`}
          icons={TableIcons}
          localization={TableLocalization}
          columns={[
            {
              title: "Cedula",
              field: "idCardPatient",
              editable: "never",
            },

            { title: "Nombre", field: "namePatient", editable: "never" },

            {
              title: "Vacuna",
              field: "vaccineName",
              editable: "never",
            },

            {
              title: "Dosis",
              field: "dose",
              editable: "never",
            },

            {
              title: "Lugar",
              field: "vaccinationPlace",
              editable: "never",
            },

            {
              title: "Detalle",
              field: "detail",
              editable: "never",
            },

            {
              title: "Fecha",
              field: "vaccinationDate",
              editable: "never",
              render: (rowData) => (
                <span className="whitespace-nowrap">
                  {new Date(rowData.vaccinationDate).toLocaleDateString(
                    "es-CR"
                  )}
                </span>
              ),
            },
          ]}
          data={vaccinates}
          actions={[
            {
              icon: Visibility,
              tooltip: "Ver Datos",
              onClick: (event, rowData) =>
                router.push(`vaccinates/${rowData.idCardPatient}/show`),
            },
            {
              icon: Add,
              tooltip: "Añadir Vacuna",
              onClick: (event, rowData) =>
                router.push(`vaccinates/${rowData.idCardPatient}`),
            },
          ]}
          options={TableOptions}
        />
      </Layout>
    )
  );
};
export default WithAuth(Vaccinates);
