"use client";

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $insertNodes,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  type LexicalCommand,
} from "lexical";

import { $createVideoNode, VideoNode } from "../nodes/video-node";

export type InsertVideoPayload = {
  src: string;
};

export const INSERT_VIDEO_COMMAND: LexicalCommand<InsertVideoPayload> =
  createCommand("INSERT_VIDEO_COMMAND");

export function VideoPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([VideoNode])) {
      throw new Error("VideoPlugin: VideoNode not registered in editor config");
    }

    return editor.registerCommand(
      INSERT_VIDEO_COMMAND,
      (payload) => {
        const videoNode = $createVideoNode(payload.src);
        $insertNodes([videoNode]);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  return null;
}
