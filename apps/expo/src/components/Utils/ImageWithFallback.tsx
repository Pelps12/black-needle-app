import { useEffect, useState } from "react";
import { Image, ImageErrorEventData, ImageProps } from "expo-image";

const fallbackImage = require("../../../assets/fallback.png");

interface ImageWithFallbackProps extends ImageProps {
  fallback?: ImageProps["source"];
}

const ImageWithFallback = ({
  fallback = fallbackImage,
  alt,
  source,
  ...props
}: ImageWithFallbackProps) => {
  const [error, setError] = useState<ImageErrorEventData | null>(null);

  useEffect(() => {
    setError(null);
  }, [source]);

  useEffect(() => {
    console.log(error);
  }, [error]);

  return (
    <Image
      alt={alt}
      onError={() => console.log("EERERIIERIEE")}
      source={error ? fallbackImage : source}
      {...props}
    />
  );
};

export default ImageWithFallback;
