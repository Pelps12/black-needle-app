export const getNotificationNumber = (
  backendArr: string[] | undefined,
  notifications: string[],
) => {
  if (backendArr) {
    const concatenatedArray = [...backendArr, ...notifications];
    const uniqueElements = new Set(concatenatedArray);
    const cardinality = uniqueElements.size;
    return cardinality;
  } else {
    return 0;
  }
};
