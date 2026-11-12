import React, { useState } from 'react';
import { Room, Resident, RoomBlock, RoomType, RoomStatus } from '../types/hostel';
import {
  Building2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Wrench,
  User,
  Download,
  Trash2,
  Edit2,
  Bed,
  X,
} from 'lucide-react';
import { api } from '../services/api';

interface RoomsViewProps {
  rooms: Room[];
  residents: Resident[];
  onRefresh: () => void;
  onOpenAllocateBedModal: (roomId: string, bedNumber: number) => void;
  onViewResident: (residentId: string) => void;
}

export const RoomsView: React.FC<RoomsViewProps> = ({
  rooms,
  residents,
  onRefresh,
  onOpenAllocateBedModal,
  onViewResident,
}) => {
  const [search, setSearch] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<string>('All');
  const [selectedFloor, setSelectedFloor] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Form states for Add/Edit Room
  const [formData, setFormData] = useState<{
    roomNumber: string;
    block: RoomBlock;
    floor: number;
    roomType: RoomType;
    capacity: number;
    monthlyRent: number;
    amenities: string[];
    status: RoomStatus;
  }>({
    roomNumber: '',
    block: 'Block A (North)',
    floor: 1,
    roomType: 'Double',
    capacity: 2,
    monthlyRent: 400,
    amenities: ['Attached Bath', 'Study Desk', 'High-Speed Wi-Fi'],
    status: 'Available',
  });

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered rooms
  const filteredRooms = rooms.filter((r) => {
    const matchesSearch = r.roomNumber.toLowerCase().includes(search.toLowerCase());
    const matchesBlock = selectedBlock === 'All' || r.block === selectedBlock;
    const matchesFloor = selectedFloor === 'All' || r.floor.toString() === selectedFloor;
    const matchesStatus = selectedStatus === 'All' || r.status === selectedStatus;
    return matchesSearch && matchesBlock && matchesFloor && matchesStatus;
  });

  const availableAmenityOptions = [
    'AC',
    'Attached Bath',
    'Balcony',
    'Study Desk',
    'High-Speed Wi-Fi',
    'Individual Lockers',
    'Mini Fridge',
    'Geyser',
  ];

  const handleOpenAdd = () => {
    setFormData({
      roomNumber: '',
      block: 'Block A (North)',
      floor: 1,
      roomType: 'Double',
      capacity: 2,
      monthlyRent: 400,
      amenities: ['Attached Bath', 'Study Desk', 'High-Speed Wi-Fi'],
      status: 'Available',
    });
    setFormError('');
    setIsAddRoomOpen(true);
  };

  const handleOpenEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      block: room.block,
      floor: room.floor,
      roomType: room.roomType,
      capacity: room.capacity,
      monthlyRent: room.monthlyRent,
      amenities: room.amenities,
      status: room.status,
    });
    setFormError('');
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.roomNumber.trim()) {
      setFormError('Room number is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError('');

      if (editingRoom) {
        await api.updateRoom(editingRoom.id, {
          roomNumber: formData.roomNumber,
          block: formData.block,
          floor: formData.floor,
          roomType: formData.roomType,
          capacity: formData.capacity,
          monthlyRent: formData.monthlyRent,
          amenities: formData.amenities,
          status: formData.status,
        });
        setEditingRoom(null);
      } else {
        await api.createRoom(formData);
        setIsAddRoomOpen(false);
      }
      onRefresh();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error saving room');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoom = async (id: string, roomNum: string) => {
    if (!confirm(`Are you sure you want to delete room ${roomNum}?`)) return;
    try {
      await api.deleteRoom(id);
      onRefresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Cannot delete room');
    }
  };

  const toggleAmenity = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(item)
        ? prev.amenities.filter((a) => a !== item)
        : [...prev.amenities, item],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Rooms & Bed Allocation</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time visual map of dormitory beds, room status, and amenities
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href={api.getExportUrl('rooms')}
            download
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Room</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search room (e.g. A-101)..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Block Filter */}
          <div>
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Wings / Blocks</option>
              <option value="Block A (North)">Block A (North)</option>
              <option value="Block B (East)">Block B (East)</option>
              <option value="Block C (West)">Block C (West)</option>
              <option value="Block D (South)">Block D (South)</option>
            </select>
          </div>

          {/* Floor Filter */}
          <div>
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Floors</option>
              <option value="1">1st Floor</option>
              <option value="2">2nd Floor</option>
              <option value="3">3rd Floor</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available (Has Vacant Beds)</option>
              <option value="Occupied">Fully Occupied</option>
              <option value="Maintenance">Under Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      {filteredRooms.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center">
          <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">No rooms matched your criteria</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, block selection, or reset the filters to see all dormitory rooms.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredRooms.map((room) => {
            const isFull = room.occupiedBeds >= room.capacity;
            const isMaintenance = room.status === 'Maintenance';

            return (
              <div
                key={room.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Room Number, Block, Type & Actions */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
                          {room.roomNumber}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Floor {room.floor}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{room.block}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(room)}
                        title="Edit room specs"
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room.id, room.roomNumber)}
                        title="Delete room"
                        disabled={room.occupiedBeds > 0}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Badges / Metrics Row (Zero-pill text styling) */}
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-medium text-slate-800 dark:text-slate-200">{room.roomType} Room</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums font-mono">${room.monthlyRent}/mo</span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={`font-semibold ${
                        isMaintenance
                          ? 'text-amber-600 dark:text-amber-400'
                          : isFull
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isMaintenance ? 'Maintenance' : isFull ? 'Full' : `${room.capacity - room.occupiedBeds} Vacant`}
                    </span>
                  </div>

                  {/* Bed Slots Visual Matrix */}
                  <div className="space-y-2 mb-4">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Bed Allocation ({room.occupiedBeds}/{room.capacity} Occupied)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {room.bedSlots.map((slot) => {
                        const isSlotOccupied = !!slot.residentId;
                        return (
                          <div
                            key={slot.bedNumber}
                            className={`p-2.5 rounded-lg border text-xs transition-colors ${
                              isSlotOccupied
                                ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                                : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/50 border-dashed'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 font-mono">
                                <Bed className="w-3 h-3 text-slate-400" />
                                Bed {slot.bedNumber}
                              </span>
                              <span
                                className={`text-[10px] font-medium ${
                                  isSlotOccupied
                                    ? 'text-indigo-600 dark:text-indigo-400'
                                    : 'text-emerald-600 dark:text-emerald-400'
                                }`}
                              >
                                {isSlotOccupied ? 'Occupied' : 'Vacant'}
                              </span>
                            </div>

                            {isSlotOccupied ? (
                              <button
                                onClick={() => slot.residentId && onViewResident(slot.residentId)}
                                className="w-full text-left font-medium text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 truncate block transition-colors cursor-pointer"
                                title={slot.residentName || 'Resident'}
                              >
                                {slot.residentName}
                              </button>
                            ) : (
                              <button
                                onClick={() => onOpenAllocateBedModal(room.id, slot.bedNumber)}
                                className="w-full py-1 text-center font-medium text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/40 rounded transition-colors cursor-pointer"
                              >
                                + Allocate
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Amenities Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 flex-wrap">
                  {room.amenities.map((item) => (
                    <span
                      key={item}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Room Modal */}
      {(isAddRoomOpen || editingRoom) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingRoom ? `Edit Room ${editingRoom.roomNumber}` : 'Create New Dormitory Room'}
              </h2>
              <button
                onClick={() => {
                  setIsAddRoomOpen(false);
                  setEditingRoom(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-lg text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveRoom} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Room Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    placeholder="e.g. A-301"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Hostel Wing / Block
                  </label>
                  <select
                    value={formData.block}
                    onChange={(e) => setFormData({ ...formData, block: e.target.value as RoomBlock })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Block A (North)">Block A (North)</option>
                    <option value="Block B (East)">Block B (East)</option>
                    <option value="Block C (West)">Block C (West)</option>
                    <option value="Block D (South)">Block D (South)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Floor</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Room Type</label>
                  <select
                    value={formData.roomType}
                    onChange={(e) => {
                      const rType = e.target.value as RoomType;
                      const capMap: Record<RoomType, number> = { Single: 1, Double: 2, Triple: 3, Quad: 4 };
                      setFormData({
                        ...formData,
                        roomType: rType,
                        capacity: capMap[rType],
                      });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Single">Single (1 Bed)</option>
                    <option value="Double">Double (2 Beds)</option>
                    <option value="Triple">Triple (3 Beds)</option>
                    <option value="Quad">Quad (4 Beds)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Rent ($)
                  </label>
                  <input
                    type="number"
                    min="50"
                    step="10"
                    value={formData.monthlyRent}
                    onChange={(e) => setFormData({ ...formData, monthlyRent: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as RoomStatus })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Available">Available for Occupancy</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Maintenance">Under Maintenance / Repairs</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Room Amenities
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {availableAmenityOptions.map((item) => (
                    <label
                      key={item}
                      className="flex items-center gap-2 p-2 rounded border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(item)}
                        onChange={() => toggleAmenity(item)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-slate-800 dark:text-slate-200">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddRoomOpen(false);
                    setEditingRoom(null);
                  }}
                  className="px-4 py-2 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : editingRoom ? 'Save Changes' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
