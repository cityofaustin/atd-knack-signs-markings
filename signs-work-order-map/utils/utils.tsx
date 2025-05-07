export const getKnackHeaders = (userToken:string, appId:string) => {
  console.log(userToken)
  console.log(appId)
    return {
    headers: {
      "X-Knack-Application-Id": appId,
      "X-Knack-REST-API-KEY": "knack",
      Authorization: userToken,
      "content-type": "application/json",
    },
  };
};
