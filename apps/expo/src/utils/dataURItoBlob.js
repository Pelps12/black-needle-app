export default async function dataURItoBlob(dataURI) {
  return fetch(dataURI).then((r) => r.blob());
}
