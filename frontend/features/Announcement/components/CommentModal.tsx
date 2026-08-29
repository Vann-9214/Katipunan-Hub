"use client";

import React from "react";
import ImageLightboxModal, {
  ImageLightboxModalProps,
} from "./ImageLightboxModal";

export type CommentModalProps = ImageLightboxModalProps;

export default function CommentModal(props: CommentModalProps) {
  return <ImageLightboxModal {...props} focusCommentInput />;
}
