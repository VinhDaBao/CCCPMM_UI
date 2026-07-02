import { createSlice } from "@reduxjs/toolkit";

// Giá trị đạt được tại thời điểm khởi tạo: Một vùng nhớ rỗng nằm trên Redux Store
const initialState = {
  nodes: [],            // Mảng chứa các đối tượng Node (Nhân vật, bối cảnh)
  edges: [],            // Mảng chứa các đối tượng Edge (Đường nối quan hệ)
  isLoading: false,     // Trạng thái chờ khi gọi API lưu/tải dữ liệu
  error: null           // Nơi lưu trữ văn bản lỗi nếu API gặp sự cố
};

const worldSlice = createSlice({
  name: "world",
  initialState,
  reducers: {
    // 1. Kích hoạt khi bắt đầu một hành động (Tải hoặc Lưu)
    worldActionStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    // 2. Kích hoạt khi hành động thất bại
    worldActionFail: (state, action) => {
      state.isLoading = false;
      state.error = action.payload; // Luôn nhận vào chuỗi thông báo lỗi cụ thể
    },
    // 3. Kích hoạt khi lấy dữ liệu sơ đồ từ Backend thành công
    fetchGraphSuccess: (state, action) => {
      state.isLoading = false;
      state.nodes = action.payload.nodes;
      state.edges = action.payload.edges;
    },
    // 4. Cập nhật nhanh trạng thái Node/Edge khi người dùng thao tác kéo thả trên Canvas
    setNodesAndEdges: (state, action) => {
      if (action.payload.nodes) state.nodes = action.payload.nodes;
      if (action.payload.edges) state.edges = action.payload.edges;
    }
  }
});

// Xuất các Action Creators để Component có thể dispatch kích hoạt thay đổi state
export const {
  worldActionStart,
  worldActionFail,
  fetchGraphSuccess,
  setNodesAndEdges
} = worldSlice.actions;

export default worldSlice.reducer;