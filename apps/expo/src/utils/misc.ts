export const getNotificationNumber = (
  backendArr: string[] | undefined,
  notifications: string[],
) => {
  if (backendArr) {
    const concatenatedArray = [...backendArr, ...notifications];
    const uniqueElements = new Set(concatenatedArray);
    const cardinality = uniqueElements.size;
    console.log("Cardinality", cardinality);
    return cardinality;
  } else {
    return 0;
  }
};
