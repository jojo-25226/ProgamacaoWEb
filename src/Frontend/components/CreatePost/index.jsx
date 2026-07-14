import { useState } from "react";

import api from "../../services/api";

import "./CreatePost.css";

function CreatePost({ onPostCreated }) {

  const [content, setContent] =
    useState("");

  const [image, setImage] =
    useState(null);

  async function handleCreatePost(e) {

    e.preventDefault();

    try {

      const formData =
        new FormData();

      formData.append(
        "content",
        content
      );

      if (image) {

        formData.append(
          "image",
          image
        );
      }

      await api.post(
        "/posts",
        formData
      );

      setContent("");
      setImage(null);

      onPostCreated();

    } catch (error) {

      console.log(error);

      alert(
        error.response?.data?.message
      );
    }
  }

  return (

    <form
      className="create-post"
      onSubmit={handleCreatePost}
    >

      <textarea
        placeholder="O que estás pensando?"
        value={content}
        onChange={(e) =>
          setContent(e.target.value)
        }
      />

      <input
        type="file"
        onChange={(e) =>
          setImage(e.target.files[0])
        }
      />

      <button type="submit">
        Publicar
      </button>

    </form>
  );
}

export default CreatePost;