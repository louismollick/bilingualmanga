import React from "react";

function FrontOfAnkiCard({ text }: { text: string }) {
  return (
    <div className="dark mx-auto w-full bg-background text-center text-accent-foreground">
      <p className="py-10 text-6xl">{text}</p>
    </div>
  );
}

export default FrontOfAnkiCard;
