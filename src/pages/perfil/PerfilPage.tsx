// src/pages/perfil/PerfilPage.tsx
import PerfilView from "@/components/perfil/PerfilView";
import { useMe } from "@/hooks/auth/useMe";

const PerfilPage = () => {
  const { me, loading, error, reload } = useMe();
  return <PerfilView me={me} loading={loading} error={error} onReload={reload} />;
};

export default PerfilPage;
