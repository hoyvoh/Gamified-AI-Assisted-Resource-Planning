import { MemberRouteStateScreen } from "@/features/analysis-chamber/components/member-route-state-screen";

export default function ScanMemberNotFound() {
  return (
    <MemberRouteStateScreen
      eyebrow="Scan Lobby"
      overline="Recovery Chamber"
      title="404 - Lost in the Citadel"
      description="Your request has led to a void. The member record tied to this scan chamber is missing, invalid, or no longer reachable from the realm roster."
      primaryAction={{ href: "/members", label: "Return to the Realm" }}
      secondaryAction={{ href: "/", label: "Consult the Scribes" }}
      imageSrc="/warrior.png"
      imageAlt="Armored warrior kneeling beside the recovery message"
      footerLabel="Lost Signal Recovery Protocol"
    />
  );
}
