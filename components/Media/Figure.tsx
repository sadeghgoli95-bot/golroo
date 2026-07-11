import Image from "next/image";

type Props = {
  src: string;
  caption: string;
};

export default function Figure({ src, caption }: Props) {
  return (
    <figure className="rhythm-sm">
      <Image src={src} width={1200} height={800} alt={caption} />
      <figcaption className="caption">{caption}</figcaption>
    </figure>
  );
}
