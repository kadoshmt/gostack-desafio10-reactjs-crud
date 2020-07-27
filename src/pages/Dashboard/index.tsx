import React, { useState, useEffect, useCallback } from 'react';

import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      const result = await api.get('/foods');
      if (result) {
        setFoods(result.data);
      }
    }

    loadFoods();
  }, []);

  const handleAddFood = useCallback(
    async (food: Omit<IFoodPlate, 'id' | 'available'>): Promise<void> => {
      try {
        const availableFood = { ...food, available: true };
        const result = await api.post('/foods', availableFood);
        if (result) {
          setFoods([...foods, result.data]);
        }
        setEditingFood({} as IFoodPlate);
      } catch (err) {
        console.log(err);
      }
    },
    [foods],
  );

  const handleUpdateFood = useCallback(
    async (food: Omit<IFoodPlate, 'id' | 'available'>): Promise<void> => {
      try {
        const { id } = editingFood;
        const updateFood = { ...food, available: editingFood.available };
        const result = await api.put(`/foods/${id}`, updateFood);
        if (result) {
          const newFoods = foods.filter(item => item.id !== id);
          setFoods([...newFoods, result.data]);
        }
      } catch (err) {
        console.log(err);
      }
    },
    [editingFood, foods],
  );

  // async function handleUpdateFood(
  //   food: Omit<IFoodPlate, 'id' | 'available'>,
  // ): Promise<void> {
  //   // TODO UPDATE A FOOD PLATE ON THE API
  // }

  const handleDeleteFood = useCallback(
    async (id: number): Promise<void> => {
      try {
        const result = await api.delete(`/foods/${id}`);
        if (result) {
          const newFoods = foods.filter(food => food.id !== id);
          setFoods(newFoods);
        }
      } catch (err) {
        console.log(err);
      }
    },
    [foods],
  );

  function toggleModal(): void {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal(): void {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: IFoodPlate): void {
    toggleEditModal();
    setEditingFood(food);
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
