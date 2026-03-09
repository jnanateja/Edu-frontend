type BrandMarkProps = {
  className?: string;
  logoClassName?: string;
  nameClassName?: string;
  showName?: boolean;
};

export default function BrandMark({
  className = "",
  logoClassName = "h-9 w-9",
  nameClassName = "text-xl font-bold text-gray-900",
  showName = true,
}: BrandMarkProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`.trim()}>
      <img
        src="/k3-rankers-adda-logo.svg"
        alt="K3 Rankers adda logo"
        className={`${logoClassName} object-contain`.trim()}
      />
      {showName ? (
        <span className={nameClassName}>K3 Rankers adda</span>
      ) : null}
    </div>
  );
}
