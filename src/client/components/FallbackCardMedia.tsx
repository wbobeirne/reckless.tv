import React, { useState, useCallback } from "react";
import { CardMedia, CardMediaProps } from "@material-ui/core";

interface Props extends Omit<CardMediaProps<"img">, "component" | "onError"> {
  /** URL of image to fallback on if src is not set / errors */
  readonly fallback: string;
}

export const FallbackCardMedia: React.FC<Props> = ({ src, fallback, ...props }) => {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src || fallback);

  const onError = useCallback(() => {
    setImgSrc(fallback);
  }, [fallback]);

  return <CardMedia {...props} component="img" src={imgSrc} onError={onError} />;
};
