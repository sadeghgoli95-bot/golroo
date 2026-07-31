import Image from "next/image";

type Props = {
  src: string;
  caption: string;
};

export default function Figure({ src, caption }: Props) {
  return (
    <figure className="rhythm-sm">
      {/* figcaption already provides the accessible description — alt="" avoids
          screen readers announcing the same caption text twice in a row. */}
      <Image src={src} width={1200} height={800} alt="" />
      <figcaption className="caption">{caption}</figcaption>
    </figure>
  );
}
