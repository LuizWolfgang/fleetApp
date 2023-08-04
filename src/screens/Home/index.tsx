import { useEffect, useState } from 'react';
import { Alert, FlatList} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Historic } from '../../libs/realm/schemas/Historic';
import { useQuery, useRealm } from '../../libs/realm';
import dayjs from 'dayjs';


import { HomeHeader } from '../../components/HomeHeader';
import { CarStatus } from '../../components/CarStatus';
import { HistoricCard, HistoricCardProps } from '../../components/HistoricCard';

import { Container, Content, Label, Title } from './styles';

import { api } from '../../services/api';
import { useNetInfo } from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';
import { SearchInput } from '../../components/SearchInput';


export function Home() {
  const [vehicleInUse, setVehicleInUse] = useState<Historic | null>(null);
  const [vehicleHistoric, setVehicleHistoric] = useState<HistoricCardProps[]>([]);
  const { navigate } = useNavigation();

  const historic = useQuery(Historic);
  const realm = useRealm();
  const netInfo = useNetInfo();

  function handleRegisterMoviment() {
    if(vehicleInUse?._id) {
      navigate('arrival', { id: vehicleInUse._id.toString() });
    } else {
      navigate('departure')
    }
  }

  function handleHistoricDetails(id: string) {
    navigate('arrival', { id})
  }

  function fetchVehicleInUse() {
    try {
      const vehicle = historic.filtered("status='departure'")[0];
      setVehicleInUse(vehicle);
    } catch (error) {
      Alert.alert('Veículo em uso', 'Não foi possível carregar o veículo em uso.');
      console.log(error);
    }
  }

 async function fetchHistoric() {
    try {
      const response = historic.filtered("status='arrival' SORT(created_at DESC)");   
      const formattedHistoric = response.map((item) => {
        return ({
          id: item._id.toString(),
          user_id: item.user_id,
          licensePlate: item.license_plate,
          description: item.description,
          isSync: item.isSync,
          coordinates: item.coords,
          created: dayjs(item.created_at).format('[Saída em] DD/MM/YYYY [às] HH:mm')
        })
      })
      setVehicleHistoric(formattedHistoric);
    } catch (error) {
      console.log(error);
      Alert.alert('Histórico', 'Não foi possível carregar o histórico.')
    }
  }

   async function syncronizeApiAndUpdateRealm() {
    try {
      for (let i = 0; i < vehicleHistoric.length; i++) {
        const data = vehicleHistoric[i];
        if(data.isSync === false){
           const response = await api.post('/car', {
            id: data.id,
            user_id: data.user_id,
            licensePlate: data.licensePlate,
            description: data.description,
            created: data.created,
            coordinates: data.coordinates,
            isSync: true,
           })

           console.log('Dados enviados para API ✅');
      
           if(response.status === 200){
              //atualiza o "isSync" no realm DB 
              realm.write(() => {
                for (const task of historic) {
                  task.isSync = true;
                }
              });
              console.log('Atualizado no Realm ✅');
           }else {
            console.error('Erro ao cadastrar na api')
           }
            Toast.show({
              type: 'success',
              text1: 'Dados sincronizados ✅'
            })
        }
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao sincronzar ❌'
      })
    }
  }

  useEffect(() => {
    fetchVehicleInUse();
  },[])

  useEffect(() => {
    realm.addListener('change', () => fetchVehicleInUse())
    return () => {
      if(realm && !realm.isClosed) {
        realm.removeListener('change', fetchVehicleInUse)
      }
    };
  },[])

  useEffect(() => {
    if(netInfo.isConnected){
      syncronizeApiAndUpdateRealm();
    }
  },[netInfo.isConnected, vehicleHistoric])

  useEffect(() => {
    fetchHistoric();
  },[historic]);  

  return (
    <Container>
      <HomeHeader />

      <Content>
        <CarStatus 
          licensePlate={vehicleInUse?.license_plate}
          onPress={handleRegisterMoviment} 
        />

        <Title>
          Histórico
        </Title>

        <SearchInput/>

        <FlatList 
          data={vehicleHistoric}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <HistoricCard 
              data={item} 
              onPress={() => handleHistoricDetails(item.id)}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={(
            <Label>
              Nenhum registro de utilização.
            </Label>
          )}
        />
      </Content>
    </Container>
  );
}