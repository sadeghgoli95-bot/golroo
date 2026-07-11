import Image from "next/image";

type Props = {
  src: string;
  alt: string;
};

export default function ImageBlock({ src, alt }: Props) {
  return (
    <div className="image-block">
      <Image src={src} alt={alt} fill style={{ objectFit: "cover" }} />
    </div>
  );
}
