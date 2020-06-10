import axios from "axios";

export default ({ req }) => {
  if (typeof window === "undefined") {
    return axios.create({
      baseURL:
        "http://www.anmoltravelsserver.in",
      headers: req.headers,
    });
  } else {
    return axios.create({
      baseURL: "/",
    });
  }
};


      // baseURL:
      //   "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local",