import { Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { X } from 'phosphor-react-native';

import { useObject, useRealm } from '../../libs/realm';
import { Historic } from '../../libs/realm/schemas/Historic';
import { getStorageLocation, removeStorageLocations } from '../../libs/asyncStorage/locationStorage';

import { BSON } from 'realm';
import { useEffect, useState } from 'react';
import { AsyncMessage, Container, Content, Description, Footer, Label, LicensePlate } from './styles';

import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { ButtonIcon } from '../../components/ButtonIcon';
import { Map } from '../../components/MapView';
import { Loading } from '../../components/Loading';
import { Locations } from '../../components/Locations';
import { LocationInfoProps } from '../../components/LocationInfo';

import { useNetInfo } from '@react-native-community/netinfo';
import { stopLocationTask } from '../../tasks/backgroundTaskLocation';

import { LatLng } from 'react-native-maps';

import { getAddressLocation } from '../../utils/getAddressLocation';
import dayjs from 'dayjs';


type RouteParamProps = {
  id: string;
}

export function Arrival() {
  const route = useRoute();
  const { id } = route.params as RouteParamProps;
  const [coordinates, setCoordinates] = useState<LatLng[]>([])
  const [departure, setDeparture] = useState<LocationInfoProps>({} as LocationInfoProps)
  const [arrival, setArrival] = useState<LocationInfoProps | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const realm = useRealm();
  const { goBack } = useNavigation();
  const historic = useObject(Historic, new BSON.UUID(id));
  const netInfo = useNetInfo();

  const title = historic?.status === 'departure' ? 'Chegada' : 'Detalhes';

  function handleRemoveVehicleUsage() {
    Alert.alert(
      'Cancelar',
      'Cancelar a utilização do veículo?',
      [
        { text: 'Não', style: 'cancel' },
        { text: 'Sim', onPress: () => removeVehicleUsage() },
      ]
    )
  }

  async function removeVehicleUsage() {
    realm.write(() =>{
      realm.delete(historic)
    });

    await stopLocationTask();
    goBack();
  }

  async function handleArrivalRegister() {
    try {

      if(!historic) {
        return Alert.alert('Erro', 'Não foi possível obter os dados para registrar a chegada do veículo.')
      }

      const locations = await getStorageLocation()

      realm.write(() => {
        historic.status = 'arrival';
        historic.updated_at = new Date();
        historic.isSync = false;
        historic.coords.push(...locations)
      });

      await stopLocationTask();

      Alert.alert('Chegada', 'Chegada registrada com sucesso.');
      removeStorageLocations();
      goBack();
    } catch (error) {
      Alert.alert('Erro', "Não foi possível registar a chegada do veículo.")
    }
  }

  async function getLocationInfo() {
    if(!historic){
      return;
    }

    if(historic?.status === 'departure') {
      const locationsStorage = await getStorageLocation();
      console.log('locationsStorage', locationsStorage)
      setCoordinates(locationsStorage);
    } else {
      setCoordinates(historic?.coords ?? []);
    }

    if(historic?.coords[0]) {
      const departureStreetName = await getAddressLocation(historic?.coords[0])

      setDeparture({
        label: `Saíndo em ${departureStreetName ?? ''}`,
        description: dayjs(new Date(historic?.coords[0].timestamp)).format('DD/MM/YYYY [às] HH:mm')
      })
    }

    if(historic?.status === 'arrival') {
      const lastLocation = historic.coords[historic.coords.length - 1]; //pegando ultima posicao
      const arrivalStreetName = await getAddressLocation(lastLocation)

      setArrival({
        label: `Chegando em ${arrivalStreetName ?? ''}`,
        description: dayjs(new Date(lastLocation.timestamp)).format('DD/MM/YYYY [às] HH:mm')
      })
    }
    setIsLoading(false)
  }

  
  useEffect(() => {
    getLocationInfo()
  },[historic])


  if(isLoading) {
    return <Loading />
  }

  return (
    <Container>
      <Header title={title} />

      {coordinates.length > 0 && (
        <Map coordinates={coordinates} />
      )}

      <Content>
        
      <Locations 
          departure={departure}
          arrival={arrival}
        />

        <Label>
          Placa do veículo
        </Label>

        <LicensePlate>
          {historic?.license_plate}
        </LicensePlate>

        <Label>
          Finalidade
        </Label>

        <Description>
          {historic?.description}
        </Description>
      </Content>

      {
        historic?.status === 'departure' &&
        <Footer>
          <ButtonIcon 
            icon={X} 
            onPress={handleRemoveVehicleUsage}
          />

          <Button 
            title='Registrar chegada' 
            onPress={handleArrivalRegister}
          />
        </Footer>
        }
        {
          historic?.isSync == false && 
          <AsyncMessage>
            Sincronização da {historic?.status === 'departure'? "partida" : "chegada"} pendente
          </AsyncMessage>
        }
    </Container>
  );
}