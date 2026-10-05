      *================================================================*
      * VEDENQ  - VEHICLE EXCISE DUTY RATE ENQUIRY (SCREEN)            *
      *                                                                *
      * OPERATOR KEYS ONE VEHICLE, PRESSES ENTER, AND GETS THE ANNUAL  *
      * RATE AND THE RULE APPLIED. CALLS VEDCALC FOR THE RULES, WHICH  *
      * ARE SET OUT IN DOCS/RULES.MD. THE 80 BY 24 SCREEN IS CENTRED   *
      * IN WHATEVER SIZE OF TERMINAL WINDOW IT STARTS IN.              *
      *                                                                *
      * UK GOVERNMENT DEMO SERVICE. FICTIONAL. RATES ARE INVENTED.     *
      *================================================================*
       IDENTIFICATION DIVISION.
       PROGRAM-ID. VEDENQ.
       ENVIRONMENT DIVISION.
       CONFIGURATION SECTION.
       SPECIAL-NAMES.
           CRT STATUS IS WS-CRT-STATUS.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-CRT-STATUS              PIC 9(4)  VALUE ZERO.
       01  WS-DONE                    PIC X     VALUE "N".
           88  OPERATOR-DONE          VALUE "Y".
       01  WS-VEHICLE.
           05  WS-REG                 PIC X(8)  VALUE SPACES.
           05  WS-FIRST-REG           PIC 9(6)  VALUE ZERO.
           05  WS-FUEL                PIC X     VALUE SPACE.
           05  WS-CO2                 PIC 9(3)  VALUE ZERO.
           05  WS-ENGINE              PIC 9(4)  VALUE ZERO.
           05  WS-PRICE               PIC 9(6)  VALUE ZERO.
           05  WS-FIRST-LIC           PIC X     VALUE SPACE.
           05  WS-LIC-START           PIC 9(6)  VALUE ZERO.
       01  WS-RESULT.
           05  WS-RATE                PIC 9(5)  VALUE ZERO.
           05  WS-CODE                PIC X(4)  VALUE SPACES.
           05  WS-CODE-R REDEFINES WS-CODE.
               10  WS-CODE-1          PIC X.
               10  WS-CODE-2          PIC X.
               10  FILLER             PIC XX.
      *----------------------------------------------------------------*
      * WHAT THE OPERATOR TYPES. NUMBERS ARE KEYED AS TEXT AND         *
      * CONVERTED, SO 95 IN A THREE-DIGIT FIELD MEANS 095, NOT 950.    *
      *----------------------------------------------------------------*
       01  WS-SCREEN-FIELDS.
           05  WS-S-FIRST-REG         PIC X(6)  VALUE SPACES.
           05  WS-S-CO2               PIC X(3)  VALUE SPACES.
           05  WS-S-ENGINE            PIC X(4)  VALUE SPACES.
           05  WS-S-PRICE             PIC X(6)  VALUE SPACES.
           05  WS-S-LIC-START         PIC X(6)  VALUE SPACES.
       01  WS-NUM-TEXT                PIC X(6)  VALUE SPACES.
       01  WS-NUM-VALUE               PIC 9(6)  VALUE ZERO.
       01  WS-SHOW-CODE               PIC X(4)  VALUE SPACES.
       01  WS-DESC                    PIC X(40) VALUE SPACES.
       01  WS-MSG                     PIC X(60) VALUE SPACES.
      *----------------------------------------------------------------*
      * SCREEN POSITION                                                *
      *----------------------------------------------------------------*
       01  WS-TERM-LINES              PIC 9(3)  VALUE ZERO.
       01  WS-TERM-COLS               PIC 9(3)  VALUE ZERO.
       01  WS-TOP                     PIC S9(3) VALUE ZERO.
       01  WS-LEFT                    PIC S9(3) VALUE ZERO.
       01  WS-POS.
           05  R01                    PIC 9(3).
           05  R03                    PIC 9(3).
           05  R04                    PIC 9(3).
           05  R06                    PIC 9(3).
           05  R07                    PIC 9(3).
           05  R08                    PIC 9(3).
           05  R09                    PIC 9(3).
           05  R10                    PIC 9(3).
           05  R11                    PIC 9(3).
           05  R12                    PIC 9(3).
           05  R13                    PIC 9(3).
           05  R16                    PIC 9(3).
           05  R17                    PIC 9(3).
           05  R20                    PIC 9(3).
           05  R24                    PIC 9(3).
           05  C01                    PIC 9(3).
           05  C06                    PIC 9(3).
           05  C24                    PIC 9(3).
           05  C28                    PIC 9(3).
           05  C45                    PIC 9(3).
           05  C50                    PIC 9(3).
       SCREEN SECTION.
       01  VED-SCREEN BLANK SCREEN
           BACKGROUND-COLOR 0 FOREGROUND-COLOR 2.
           05  LINE R01 COL C01 VALUE "VEDENQ01" HIGHLIGHT.
           05  LINE R01 COL C28 VALUE "UK GOVERNMENT DEMO SERVICE"
               HIGHLIGHT.
           05  LINE R03 COL C24
               VALUE "VEHICLE EXCISE DUTY - RATE ENQUIRY"
               HIGHLIGHT.
           05  LINE R04 COL C24
               VALUE "----------------------------------"
               HIGHLIGHT.
           05  LINE R06 COL C06
               VALUE "REGISTRATION MARK . . . . . . . . . :"
               HIGHLIGHT.
           05  LINE R06 COL C45 PIC X(8) USING WS-REG
               UNDERLINE HIGHLIGHT.
           05  LINE R07 COL C06
               VALUE "DATE OF FIRST REGISTRATION (DDMMYY) :"
               HIGHLIGHT.
           05  LINE R07 COL C45 PIC X(6) USING WS-S-FIRST-REG
               UNDERLINE HIGHLIGHT.
           05  LINE R08 COL C06
               VALUE "FUEL TYPE (P/D/E) . . . . . . . . . :"
               HIGHLIGHT.
           05  LINE R08 COL C45 PIC X USING WS-FUEL
               UNDERLINE HIGHLIGHT.
           05  LINE R09 COL C06
               VALUE "CO2 EMISSIONS (G/KM)  . . . . . . . :"
               HIGHLIGHT.
           05  LINE R09 COL C45 PIC X(3) USING WS-S-CO2
               UNDERLINE HIGHLIGHT.
           05  LINE R10 COL C06
               VALUE "ENGINE SIZE (CC)  . . . . . . . . . :"
               HIGHLIGHT.
           05  LINE R10 COL C45 PIC X(4) USING WS-S-ENGINE
               UNDERLINE HIGHLIGHT.
           05  LINE R11 COL C06
               VALUE "LIST PRICE (GBP)  . . . . . . . . . :"
               HIGHLIGHT.
           05  LINE R11 COL C45 PIC X(6) USING WS-S-PRICE
               UNDERLINE HIGHLIGHT.
           05  LINE R12 COL C06
               VALUE "FIRST LICENCE (Y/N) . . . . . . . . :"
               HIGHLIGHT.
           05  LINE R12 COL C45 PIC X USING WS-FIRST-LIC
               UNDERLINE HIGHLIGHT.
           05  LINE R13 COL C06
               VALUE "LICENCE START DATE (DDMMYY) . . . . :"
               HIGHLIGHT.
           05  LINE R13 COL C45 PIC X(6) USING WS-S-LIC-START
               UNDERLINE HIGHLIGHT.
           05  LINE R16 COL C06
               VALUE "ANNUAL RATE . . . . . . . . . . . . :"
               HIGHLIGHT.
           05  LINE R16 COL C45 VALUE "GBP" HIGHLIGHT.
           05  LINE R16 COL C50 PIC ZZ,ZZ9 FROM WS-RATE HIGHLIGHT.
           05  LINE R17 COL C06
               VALUE "RULE APPLIED  . . . . . . . . . . . :"
               HIGHLIGHT.
           05  LINE R17 COL C45 PIC X(4) FROM WS-SHOW-CODE HIGHLIGHT.
           05  LINE R17 COL C50 PIC X(26) FROM WS-DESC HIGHLIGHT.
           05  LINE R20 COL C06 PIC X(60) FROM WS-MSG HIGHLIGHT.
           05  LINE R24 COL C01
               VALUE "ENTER=CALCULATE   ESC=EXIT"
               HIGHLIGHT.
       PROCEDURE DIVISION.
       0000-MAIN.
           SET ENVIRONMENT "COB_SCREEN_EXCEPTIONS" TO "Y"
           SET ENVIRONMENT "COB_SCREEN_ESC" TO "Y"
           PERFORM 1000-SET-POSITION
           PERFORM UNTIL OPERATOR-DONE
               DISPLAY VED-SCREEN
               ACCEPT VED-SCREEN
               EVALUATE WS-CRT-STATUS
                   WHEN 2005
                   WHEN 1003
                       SET OPERATOR-DONE TO TRUE
                   WHEN OTHER
                       PERFORM 2000-ENQUIRE
               END-EVALUATE
           END-PERFORM
           STOP RUN.
      *----------------------------------------------------------------*
      * 1000 - CENTRE THE 80 BY 24 SCREEN IN THE TERMINAL WINDOW.      *
      *----------------------------------------------------------------*
       1000-SET-POSITION.
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
           COMPUTE R06 = WS-TOP + 6
           COMPUTE R07 = WS-TOP + 7
           COMPUTE R08 = WS-TOP + 8
           COMPUTE R09 = WS-TOP + 9
           COMPUTE R10 = WS-TOP + 10
           COMPUTE R11 = WS-TOP + 11
           COMPUTE R12 = WS-TOP + 12
           COMPUTE R13 = WS-TOP + 13
           COMPUTE R16 = WS-TOP + 16
           COMPUTE R17 = WS-TOP + 17
           COMPUTE R20 = WS-TOP + 20
           COMPUTE R24 = WS-TOP + 24
           COMPUTE C01 = WS-LEFT + 1
           COMPUTE C06 = WS-LEFT + 6
           COMPUTE C24 = WS-LEFT + 24
           COMPUTE C28 = WS-LEFT + 28
           COMPUTE C45 = WS-LEFT + 45
           COMPUTE C50 = WS-LEFT + 50.
      *----------------------------------------------------------------*
      * 2000 - RATE ONE VEHICLE AND SET UP THE RESULT LINES.           *
      *----------------------------------------------------------------*
       2000-ENQUIRE.
           MOVE FUNCTION UPPER-CASE (WS-FUEL)      TO WS-FUEL
           MOVE FUNCTION UPPER-CASE (WS-FIRST-LIC) TO WS-FIRST-LIC
           MOVE WS-S-FIRST-REG TO WS-NUM-TEXT
           PERFORM 2100-TO-NUMBER
           MOVE WS-NUM-VALUE TO WS-FIRST-REG
           MOVE WS-FIRST-REG TO WS-S-FIRST-REG
           MOVE WS-S-CO2 TO WS-NUM-TEXT
           PERFORM 2100-TO-NUMBER
           MOVE WS-NUM-VALUE TO WS-CO2
           MOVE WS-CO2 TO WS-S-CO2
           MOVE WS-S-ENGINE TO WS-NUM-TEXT
           PERFORM 2100-TO-NUMBER
           MOVE WS-NUM-VALUE TO WS-ENGINE
           MOVE WS-ENGINE TO WS-S-ENGINE
           MOVE WS-S-PRICE TO WS-NUM-TEXT
           PERFORM 2100-TO-NUMBER
           MOVE WS-NUM-VALUE TO WS-PRICE
           MOVE WS-PRICE TO WS-S-PRICE
           MOVE WS-S-LIC-START TO WS-NUM-TEXT
           PERFORM 2100-TO-NUMBER
           MOVE WS-NUM-VALUE TO WS-LIC-START
           MOVE WS-LIC-START TO WS-S-LIC-START
           CALL "VEDCALC" USING WS-VEHICLE WS-RESULT
           MOVE WS-CODE TO WS-SHOW-CODE
           MOVE SPACES  TO WS-DESC WS-MSG
           EVALUATE TRUE
               WHEN WS-CODE = "E01"
                   MOVE "INVALID DATE OF FIRST REGISTRATION" TO WS-MSG
               WHEN WS-CODE = "E02"
                   MOVE "INVALID LICENCE START DATE" TO WS-MSG
               WHEN WS-CODE = "E03"
                   MOVE "FIRST REGISTRATION AFTER LICENCE START"
                       TO WS-MSG
               WHEN WS-CODE = "E04"
                   MOVE "FUEL TYPE MUST BE P, D OR E" TO WS-MSG
               WHEN WS-CODE = "E05"
                   MOVE "FIRST LICENCE MUST BE Y OR N" TO WS-MSG
               WHEN WS-CODE = "HIST"
                   MOVE "HISTORIC VEHICLE, EXEMPT" TO WS-DESC
               WHEN WS-CODE = "ELEC"
                   MOVE "ELECTRIC, ZERO RATE" TO WS-DESC
               WHEN WS-CODE = "ENG1"
                   MOVE "PRE 2001, UP TO 1549 CC" TO WS-DESC
               WHEN WS-CODE = "ENG2"
                   MOVE "PRE 2001, OVER 1549 CC" TO WS-DESC
               WHEN WS-CODE = "STD"
                   MOVE "STANDARD RATE" TO WS-DESC
               WHEN WS-CODE = "STDS"
                   MOVE "STANDARD PLUS SUPPLEMENT" TO WS-DESC
               WHEN WS-CODE-1 = "B"
                   STRING "2001 TO 2017, BAND " WS-CODE-2
                       DELIMITED BY SIZE INTO WS-DESC
               WHEN WS-CODE-1 = "F"
                   STRING "FIRST LICENCE, BAND " WS-CODE-2
                       DELIMITED BY SIZE INTO WS-DESC
           END-EVALUATE
           IF WS-MSG = SPACES
               STRING "RATE CALCULATED FOR " DELIMITED BY SIZE
                      WS-REG DELIMITED BY SPACE
                      INTO WS-MSG
           END-IF.
      *----------------------------------------------------------------*
      * 2100 - TYPED TEXT TO A NUMBER. BLANK OR NOT A WHOLE NUMBER     *
      *        IS READ AS ZERO.                                        *
      *----------------------------------------------------------------*
       2100-TO-NUMBER.
           MOVE ZERO TO WS-NUM-VALUE
           IF WS-NUM-TEXT NOT = SPACES
              AND FUNCTION TRIM (WS-NUM-TEXT) IS NUMERIC
               COMPUTE WS-NUM-VALUE =
                   FUNCTION NUMVAL (WS-NUM-TEXT)
           END-IF.
