import { Search, X } from "lucide-react-native";
import React from "react";
import { TextInput, TouchableOpacity, View } from "react-native";

interface Props {
  placeholder: string;
  onPress?: () => void;
  value?: string;
  onChangeText: (text: string) => void;
}

const SearchBox = ({
  onPress,
  placeholder,
  value,
  onChangeText,
  className,
}: Props & { className?: string }) => {
  return (
    <View
      className={`flex-row items-center bg-dark-100 rounded-full px-4 py-2  ${className}`}
    >
      <Search className="text-gray-400 mr-2" size={18} />
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="gray"
        className="flex-1 text-white"
      />
      {value ? (
        <TouchableOpacity
          onPress={() => onChangeText("")}
          className="w-7 h-7 rounded-full bg-gray-700 items-center justify-center"
        >
          <X className="text-accent" size={16} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default SearchBox;
