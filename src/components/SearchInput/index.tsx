import React from 'react';

import {
  Container, Input, SearchIcon, ContentSearch
} from './styles';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

type searchProps = {
    onFilter: (data: any) => void;
}

export function SearchInput({ onFilter }: searchProps) {
  const navigation = useNavigation();
  return (
    <Container>
      <ContentSearch>
        <SearchIcon name="search" size={20} color="#666" />
      </ContentSearch>

      <Input
        placeholder="Buscar placa"
        placeholderTextColor="#999"
        onChangeText={onFilter}
      />
    </Container>
  );
}
