import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';

export const Container = styled.View`
    flex-direction: row;
    align-items: center;
    background-color: #f5f5f5;
    padding: 2px;
    width: 100%;
    border-radius: 10px;
    margin-bottom: 30px;
`;

export const ContentSearch = styled.View`
    margin-left: 10px;
`

export const SearchIcon = styled(Ionicons)`
    margin-right: 10px;
`;

export const Input = styled.TextInput`
  flex: 1;
  font-size: 16px;
`;


