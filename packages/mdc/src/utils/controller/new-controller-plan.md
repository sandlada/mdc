# New Controller for Element State based on Scrolling Behavior

## Intro

這個Controller用於實現一個元素（host）根據滾動行為自動顯示/隱藏的功能。當用戶向下滾動頁面時，host會自動隱藏；當用戶向上滾動頁面時，host會自動顯示。
這個Controller還支持一些額外的功能，如浮動位置、半隱藏狀態等。
這個Controller主要目的是提供靈活且易於使用的API，讓開發者能夠輕鬆地為他們的網站或應用添加這種基於滾動行為的元素顯示/隱藏功能。符合Material Design的相關規範，並且提供良好的用戶體驗。

## Properties

### Floating

| Property | Type    | Default | Description                  |
| :------- | :------ | :------ | ---------------------------- |
| floating | boolean | false   | Whether the host is floating |

- 默認參數（false）下，host會正常參與HTML編排（類似block元素）。
- 當floating為true時，host會浮動在頁面上，不會影響其他元素編排（類似position: fixed）。

這個參數會影響如下參數：

- placement：當floating為true時，placement取值有效；當floating為false時，placement取值無意義。

### Placement

先決條件：floating必須為true。

| Property  | Type      | Default  | Description                         |
| :-------- | :-------- | :------- | ----------------------------------- |
| placement | Placement | "bottom" | The position of the navigation host |

Placement對象取值：

| Placement        |  Value |
| :--------------- | -----: |
| Placement.Top    |    top |
| Placement.Right  |  right |
| Placement.Bottom | bottom |
| Placement.Left   |   left |

floating + placement情況下host只顯示元素的一部分，但這個部分是：

- left：顯示右側部分
- right：顯示左側部分
- top：顯示底部部分
- bottom：顯示頂部部分

以floating+bottom+未聚焦狀態（鼠標沒有懸停在host上，用戶也沒有點擊host）爲例(host浮動在視圖上)：

```plaintext
_________________________________________________________
|    頁面內容區域                                       |
|                                                       |
|              |=============================|          |
|              |  host區域                   |          |
|______________|_____________________________|__________|
               |                             |
               | host隱藏部分                |
               |=============================|
```

以floating+bottom+聚焦狀態爲例(host浮動在視圖上)：

```plaintext
_________________________________________________________
|    頁面內容區域                                       |
|                                                       |
|              |=============================|          |
|              |  host區域                   |          |
|              |                             |          |
|              |=============================|          |
|_______________________________________________________|
```

以not floating爲例（host類似block或flex在HTML中編排）：

```plaintext
_________________________________________________________
|    頁面內容區域                                       |
|                                                       |
|                                                       |
|              |                             |          |
|              |  host區域                   |          |
|              |                             |          |
|_______________________________________________________|
```

### AutoHide

| Property | Type    | Default | Description                            |
| :------- | :------ | :------ | -------------------------------------- |
| autoHide | boolean | false   | Whether the navigation host auto-hides |

auto-hide會監聽ScrollElementId滾動事件。不同floating狀態下，auto-hide的行為不同：

- 當floating為true時：當滾動方向向下時，host會自動隱藏進入peek狀態（只隱藏一般，不完全隱藏元素）；當滾動方向向上、鼠標懸停、用戶點擊（移動端中，每當用戶在host隱藏后點擊元素，這將設置host元素進入完全顯示狀態，第二次點擊才真正點擊到元素内部）時，host會自動顯示。
- 當floating為false時：當滾動方向向下時，host會自動隱藏進入完全隱藏狀態（完全隱藏元素，host元素不再占用空間）；當滾動方向向上時，host會自動顯示。

### ScrollElementId

| Property        | Type   | Default | Description                  |
| :-------------- | :----- | :------ | ---------------------------- |
| scrollElementId | string | null    | 用於指定需要監聽滾動元素的ID |

## 消失序列

與floating、autoHide、placement有關（host元素按照方向分配代詞表示host結構，從上至下123，從左至右abc）：

無論floating取值如何，關閉動畫的消失序列：

- left：左綫a不動，消失序列cba
- right：右綫c不動，消失序列abc
- top：頂綫1不動，消失序列321
- bottom：底綫3不動，消失序列123

floating為true時，host關閉后進入半隱藏狀態后，鼠標懸浮在host元素上會顯示完整host，鼠標離開后在一定間隔時間后恢復到半隱藏狀態。（在移動端，用戶需要先點擊半隱藏host（此時第一次點擊只是爲了顯示完整host，不會出發内部元素的點擊事件），然後才能實際點擊内部元素）。
