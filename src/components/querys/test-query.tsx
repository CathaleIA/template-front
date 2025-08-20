'use client'

import { gql, useQuery, useSubscription  } from '@apollo/client';

const GET_STATUS = gql`
  query GetStatus($assetId: String!) {
    getStatus(assetId: $assetId) {
      assetId
      status
      timestamp
    }
  }
`;

const GET_METRICS = gql`
  query GetMetrics($assetId: String!, $start: String!, $end: String!) {
    getMetrics(assetId: $assetId, start: $start, end: $end) {
      timestamp
      metric
      value
    }
  }
`;

const SUBSCRIBE_UPDATE = gql`
  subscription OnUpdate {
    onUpdate {
      assetId
      status
      timestamp
      presionAceite
      presionCombustible
      presionTurbo
    }
  }
`;

export const StatusComponent = ({ assetId }: { assetId: string }) => {
  const { data, loading, error } = useQuery(GET_STATUS, {
    variables: { assetId },
  });

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <pre>{JSON.stringify(data, null, 2)}</pre>
  )
};

export const MetricsComponent = ({
  assetId,
  start,
  end,
}: {
  assetId: string;
  start: string;
  end: string;
}) => {
  const { data, loading, error } = useQuery(GET_METRICS, {
    variables: { assetId, start, end },
  });

  if (loading) return <p>Cargando métricas...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <pre>{JSON.stringify(data.getMetrics, null, 2)}</pre>
  );
};


export const UpdateSubscription = () => {
  const { data, loading, error } = useSubscription(SUBSCRIBE_UPDATE);

  if (loading) return <p>Esperando actualizaciones...</p>;
  if (error) return <p>Error en la suscripción: {error.message}</p>;

  return (
    <div>
      <h3>Última actualización:</h3>
      <pre>{JSON.stringify(data?.onUpdate, null, 2)}</pre>
    </div>
  );
};