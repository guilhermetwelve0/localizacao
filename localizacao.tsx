import { RepositoryItem } from "./RepositoryItem";
import { useState, useEffect } from 'react';
import '../styles/repositories.scss';

export function RepositoryList() {
    const [repositories, setRepositories] = useState([]);
    const [clienteLat, setClienteLat] = useState(null);
    const [clienteLon, setClienteLon] = useState(null);
    const [distancia, setDistancia] = useState(null);
    const [precoEntrega, setPrecoEntrega] = useState(null);
    const [error, setError] = useState(null);

    // Coordenadas do restaurante (exemplo)
    const restauranteLat = -25.530863;
    const restauranteLon = -49.300780;

    useEffect(() => {
        // Buscar repositórios da organização
        fetch('https://api.github.com/orgs/rocketseat/repos')
            .then(response => response.json())
            .then(data => setRepositories(data));
    }, []);

    // Função para converter graus em radianos
    const toRadians = (degree) => {
        return degree * (Math.PI / 180);
    };

    // Função para calcular a distância usando a fórmula Haversine
    const calcularDistancia = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Raio da Terra em km
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Retorna a distância em km
    };

    // Função para calcular a entrega
    const calcularEntrega = () => {
        const dist = calcularDistancia(clienteLat, clienteLon, restauranteLat, restauranteLon);
        setDistancia(dist.toFixed(2));

        if (dist <= 5) {
            setPrecoEntrega(15);
        } else {
            setPrecoEntrega(20);
        }
    };

    // Função para pegar a localização automática do cliente
    const pegarLocalizacao = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setClienteLat(position.coords.latitude);
                    setClienteLon(position.coords.longitude);
                    setError(null); // Limpar qualquer erro anterior
                },
                (err) => {
                    setError('Erro ao acessar a localização. Verifique as permissões.');
                }
            );
        } else {
            setError('Geolocalização não é suportada pelo seu navegador.');
        }
    };

    return (
        <section className="repository-list">
            <h1>Lista de repositórios</h1>
            <ul>
                {repositories.map(repository => {
                    return <RepositoryItem key={repository.name} repository={repository} />
                })}
            </ul>

            <div style={{ paddingTop: '20px' }}>
                <h2>Calcular Entrega</h2>
                <button onClick={pegarLocalizacao}>Pegar minha localização</button>

                {clienteLat && clienteLon ? (
                    <div>
                        <p>Latitude do cliente: {clienteLat}</p>
                        <p>Longitude do cliente: {clienteLon}</p>
                        <button onClick={calcularEntrega}>Calcular Entrega</button>
                    </div>
                ) : (
                    <p>Aguardando a localização...</p>
                )}

                {error && <p style={{ color: 'red' }}>{error}</p>}

                {distancia && (
                    <div>
                        <h3>Distância até o restaurante: {distancia} km</h3>
                        <h3>Preço da entrega: R${precoEntrega}</h3>
                    </div>
                )}
            </div>
        </section>
    );
}
