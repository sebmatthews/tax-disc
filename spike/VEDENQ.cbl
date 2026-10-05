      *================================================================*
      * VEDENQ  - VEHICLE EXCISE DUTY RATE ENQUIRY                     *
      * GREEN SCREEN SPIKE FOR THE TAX DISC DEMO. NOT THE REAL         *
      * SERVICE. RATES ARE INVENTED.                                   *
      *================================================================*
       IDENTIFICATION DIVISION.
       PROGRAM-ID. VEDENQ.
       ENVIRONMENT DIVISION.
       CONFIGURATION SECTION.
       SPECIAL-NAMES.
           CRT STATUS IS WS-CRT-STATUS.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-CRT-STATUS          PIC 9(4)  VALUE ZERO.
       01  WS-DONE                PIC X     VALUE "N".
       01  WS-REG                 PIC X(8)  VALUE SPACES.
       01  WS-CO2                 PIC 9(3)  VALUE ZERO.
       01  WS-FUEL                PIC X     VALUE SPACE.
       01  WS-RATE                PIC 9(4)  VALUE ZERO.
       01  WS-MSG                 PIC X(60) VALUE SPACES.
      *    SCREEN POSITION. THE 80 BY 24 SCREEN IS CENTRED IN
      *    WHATEVER SIZE OF TERMINAL WINDOW IT IS RUN IN.
       01  WS-TERM-LINES          PIC 9(3)  VALUE ZERO.
       01  WS-TERM-COLS           PIC 9(3)  VALUE ZERO.
       01  WS-TOP                 PIC S9(3) VALUE ZERO.
       01  WS-LEFT                PIC S9(3) VALUE ZERO.
       01  WS-POS.
           05  R01                PIC 9(3).
           05  R03                PIC 9(3).
           05  R04                PIC 9(3).
           05  R07                PIC 9(3).
           05  R09                PIC 9(3).
           05  R11                PIC 9(3).
           05  R15                PIC 9(3).
           05  R20                PIC 9(3).
           05  R24                PIC 9(3).
           05  C01                PIC 9(3).
           05  C06                PIC 9(3).
           05  C22                PIC 9(3).
           05  C27                PIC 9(3).
           05  C33                PIC 9(3).
           05  C36                PIC 9(3).
       SCREEN SECTION.
       01  VED-SCREEN BLANK SCREEN
           BACKGROUND-COLOR 0 FOREGROUND-COLOR 2.
           05  LINE R01 COL C01 VALUE "VEDENQ01" HIGHLIGHT.
           05  LINE R01 COL C27 VALUE "UK GOVERNMENT DEMO SERVICE"
               HIGHLIGHT.
           05  LINE R03 COL C22
               VALUE "VEHICLE EXCISE DUTY - RATE ENQUIRY"
               HIGHLIGHT.
           05  LINE R04 COL C22 
               VALUE "----------------------------------"
               HIGHLIGHT.
           05  LINE R07 COL C06 VALUE "REGISTRATION MARK . . . :"
               HIGHLIGHT.
           05  LINE R07 COL C33 PIC X(8) USING WS-REG
               UNDERLINE HIGHLIGHT.
           05  LINE R09 COL C06 VALUE "CO2 EMISSIONS (G/KM)  . :"
               HIGHLIGHT.
           05  LINE R09 COL C33 PIC 9(3) USING WS-CO2
               UNDERLINE HIGHLIGHT.
           05  LINE R11 COL C06 VALUE "FUEL TYPE (P/D/E) . . . :"
               HIGHLIGHT.
           05  LINE R11 COL C33 PIC X USING WS-FUEL
               UNDERLINE HIGHLIGHT.
           05  LINE R15 COL C06 VALUE "ANNUAL RATE . . . . . . : GBP"
               HIGHLIGHT.
           05  LINE R15 COL C36 PIC Z,ZZ9 FROM WS-RATE HIGHLIGHT.
           05  LINE R20 COL C06 PIC X(60) FROM WS-MSG HIGHLIGHT.
           05  LINE R24 COL C01
               VALUE "ENTER=CALCULATE   ESC=EXIT"
               HIGHLIGHT.
       PROCEDURE DIVISION.
       MAIN-PARA.
           SET ENVIRONMENT "COB_SCREEN_EXCEPTIONS" TO "Y"
           SET ENVIRONMENT "COB_SCREEN_ESC" TO "Y"
           PERFORM SET-POSITION
           PERFORM UNTIL WS-DONE = "Y"
               DISPLAY VED-SCREEN
               ACCEPT VED-SCREEN
               EVALUATE WS-CRT-STATUS
                   WHEN 2005
                   WHEN 1003
                       MOVE "Y" TO WS-DONE
                   WHEN OTHER
                       PERFORM CALC-RATE
               END-EVALUATE
           END-PERFORM
           STOP RUN.
       SET-POSITION.
           ACCEPT WS-TERM-LINES FROM LINES
           ACCEPT WS-TERM-COLS FROM COLUMNS
           COMPUTE WS-TOP  = (WS-TERM-LINES - 24) / 2
           COMPUTE WS-LEFT = (WS-TERM-COLS - 80) / 2
           IF WS-TOP < 0
               MOVE 0 TO WS-TOP
           END-IF
           IF WS-LEFT < 0
               MOVE 0 TO WS-LEFT
           END-IF
           COMPUTE R01 = WS-TOP + 1
           COMPUTE R03 = WS-TOP + 3
           COMPUTE R04 = WS-TOP + 4
           COMPUTE R07 = WS-TOP + 7
           COMPUTE R09 = WS-TOP + 9
           COMPUTE R11 = WS-TOP + 11
           COMPUTE R15 = WS-TOP + 15
           COMPUTE R20 = WS-TOP + 20
           COMPUTE R24 = WS-TOP + 24
           COMPUTE C01 = WS-LEFT + 1
           COMPUTE C06 = WS-LEFT + 6
           COMPUTE C22 = WS-LEFT + 22
           COMPUTE C27 = WS-LEFT + 27
           COMPUTE C33 = WS-LEFT + 33
           COMPUTE C36 = WS-LEFT + 36.
       CALC-RATE.
           MOVE SPACES TO WS-MSG
           EVALUATE TRUE
               WHEN WS-FUEL = "E" OR WS-FUEL = "e"
                   MOVE 0 TO WS-RATE
               WHEN WS-CO2 <= 100
                   MOVE 20 TO WS-RATE
               WHEN WS-CO2 <= 150
                   MOVE 180 TO WS-RATE
               WHEN WS-CO2 <= 200
                   MOVE 340 TO WS-RATE
               WHEN OTHER
                   MOVE 690 TO WS-RATE
           END-EVALUATE
           IF WS-FUEL = "D" OR WS-FUEL = "d"
               ADD 30 TO WS-RATE
           END-IF
           STRING "RATE CALCULATED FOR " DELIMITED BY SIZE
                  WS-REG DELIMITED BY SPACE
                  INTO WS-MSG
           END-STRING.
