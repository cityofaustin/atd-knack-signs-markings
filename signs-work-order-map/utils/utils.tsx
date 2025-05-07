export const getKnackHeaders = (userToken:string, appId:string) => {
    return {
    headers: {
      "X-Knack-Application-Id": appId,
      "X-Knack-REST-API-KEY": "knack",
      Authorization: userToken,
      "content-type": "application/json",
    },
  };
};
