"use client";
import React from "react";
import { Trash2 } from "lucide-react";

const PlaylistCard = ({ name, coverImage, onDelete }) => {
  return (
    <div className="relative p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition">
      <img
        src={coverImage || "/default.jpg"}
        alt={name}
        className="rounded-xl object-cover h-40 w-full mb-2"
      />
      <h2 className="text-black font-semibold text-center">{name}</h2>

      {onDelete && (
        <button
          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
          onClick={() => {
            if (confirm("Are you sure you want to delete this playlist?")) {
              onDelete();
            }
          }}
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  );
};

export default PlaylistCard;
